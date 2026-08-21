// Filtros de "melhoria de qualidade percebida" — nenhum deles aumenta a
// resolução real do vídeo (isso exigiria super-resolução por IA, inviável
// em tempo real sem GPU dedicada). São técnicas legítimas de
// processamento de imagem, as mesmas usadas por players profissionais
// (VLC, madVR) para melhorar a leitura de vídeo já comprimido:
//
// - Nitidez (unsharp mask via feConvolveMatrix): realça bordas existentes.
// - Redução de ruído (blur seletivo leve): suaviza banding/blocking de
//   compressão em áreas planas (céu, sombras, pele), sem borrar bordas
//   nítidas — por isso o blur aqui é bem mais sutil que o do liquid glass.
//
// Os dois juntos combatem sintomas opostos e comuns em stream de baixo
// bitrate: "mole demais" (nitidez ajuda) e "quadriculado/banding"
// (redução de ruído ajuda) — um vídeo geralmente tem mais de um problema
// ao mesmo tempo, então os dois controles ficam independentes.

export function SharpenFilterDefs({ id = 'klarity-sharpen', strength = 0 }) {
  if (strength <= 0) return null;

  // strength 0-100 mapeado para o peso central do kernel 3x3. Testado
  // visualmente contra um padrão de referência: um teto de 5.0 (comum em
  // exemplos de "sharpen" na documentação) degrada a imagem a ponto de
  // ficar ilegível bem antes dos 100%. 1.8 é o teto que ainda produz
  // realce perceptível sem destruir a imagem em nenhum ponto da escala.
  const center = 1 + (strength / 100) * 0.8;
  const edge = -(center - 1) / 4;

  const kernelMatrix = [
    edge, edge, edge,
    edge, center, edge,
    edge, edge, edge,
  ].join(' ');

  return (
    <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <filter id={id} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feConvolveMatrix
            order="3"
            kernelMatrix={kernelMatrix}
            divisor="1"
            edgeMode="duplicate"
            preserveAlpha="true"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function DenoiseFilterDefs({ id = 'klarity-denoise', strength = 0 }) {
  if (strength <= 0) return null;

  // Blur bem mais fraco que o do liquid glass (que vai até 48px) — aqui
  // o objetivo é só quebrar o banding em degradês, não borrar a imagem.
  // Testado visualmente: 1.1px no máximo já degrada texto/detalhe fino
  // visivelmente. Reduzido para 0.6px de teto, que ainda suaviza banding
  // perceptível sem comprometer legibilidade de texto na tela (nome de
  // jogador, HUD, chat sobreposto pelo próprio streamer, etc.).
  const stdDeviation = (strength / 100) * 0.6;

  return (
    <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <filter id={id} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={stdDeviation} edgeMode="duplicate" />
        </filter>
      </defs>
    </svg>
  );
}
