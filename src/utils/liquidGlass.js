// Gera o displacement map (imagem PNG codificada em base64) usado pelo
// filtro SVG <feDisplacementMap> para simular refração real de vidro —
// não é blur, é deslocamento físico de pixels, seguindo a mesma técnica
// documentada em https://kube.io/blog/liquid-glass-css-svg/
//
// A superfície usada é convexa em formato "squircle" (a mesma curva que a
// Apple usa no Liquid Glass): y = (1 - (1-x)^4)^(1/4). Ela tem transição
// mais suave entre a borda curva e o centro plano do que um círculo puro,
// o que evita bordas de refração muito duras quando o elemento é
// esticado (retângulos, não só círculos/quadrados).

function surfaceHeight(x) {
  const clamped = Math.min(Math.max(x, 0), 1);
  return Math.pow(1 - Math.pow(1 - clamped, 4), 0.25);
}

// Deriva a altura numericamente para achar a normal da superfície em
// cada ponto — é essa normal que determina para onde a luz se desloca.
function surfaceNormalAngle(x) {
  const delta = 0.001;
  const y1 = surfaceHeight(Math.max(0, x - delta));
  const y2 = surfaceHeight(Math.min(1, x + delta));
  const derivative = (y2 - y1) / (2 * delta);
  // normal = (-derivative, 1), convertida para ângulo
  return Math.atan2(1, -derivative);
}

/**
 * Gera um displacement map como data URL de PNG.
 * @param {number} size - lado do canvas quadrado (px). Maior = mais suave.
 * @param {number} bezelRatio - fração do raio ocupada pela borda curva (0-1).
 * @returns {string} data URL "data:image/png;base64,..."
 */
export function generateDisplacementMap(size = 128, bezelRatio = 0.35) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2;
  const bezelWidth = maxRadius * bezelRatio;

  // Pré-calcula a magnitude de deslocamento normalizada para cada
  // distância à borda (0 = borda externa, 1 = fim do bezel) — depois
  // reaplicada radialmente por simetria, como a fonte descreve.
  const samples = 128;
  const magnitudes = new Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    // ângulo da normal em relação à vertical → maior inclinação = maior
    // deslocamento lateral da luz refratada
    const angle = surfaceNormalAngle(t);
    magnitudes[i] = Math.cos(angle); // componente horizontal do desvio
  }
  const maxMagnitude = Math.max(...magnitudes.map(Math.abs)) || 1;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - cx;
      const dy = py - cy;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      const distFromEdge = maxRadius - distFromCenter;

      let r = 128;
      let g = 128;

      if (distFromEdge >= 0 && distFromEdge <= bezelWidth) {
        // dentro do bezel: aplica deslocamento radial em direção ao centro
        const t = 1 - distFromEdge / bezelWidth; // 0 na borda, 1 no fim do bezel
        const sampleIndex = Math.min(samples - 1, Math.floor(t * (samples - 1)));
        const magnitude = magnitudes[sampleIndex] / maxMagnitude;

        const norm = distFromCenter > 0 ? 1 / distFromCenter : 0;
        const dirX = dx * norm;
        const dirY = dy * norm;

        r = 128 + dirX * magnitude * 127;
        g = 128 + dirY * magnitude * 127;
      }
      // fora do bezel (centro plano ou fora do elemento): sem deslocamento

      const idx = (py * size + px) * 4;
      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

// Cache simples: o mapa só depende de (size, bezelRatio), então gerar uma
// vez por combinação evita recalcular a cada render/remontagem de
// componente — a geração em si é ~size² operações, não é grátis.
const cache = new Map();

export function getCachedDisplacementMap(size = 128, bezelRatio = 0.35) {
  const key = `${size}:${bezelRatio}`;
  if (!cache.has(key)) {
    cache.set(key, generateDisplacementMap(size, bezelRatio));
  }
  return cache.get(key);
}
