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

  // BUG CORRIGIDO: a fórmula anterior (center = 1 + strength*0.8, edge =
  // -(center-1)/4) fazia a SOMA dos pesos do kernel cair conforme a
  // intensidade subia (soma = 2 - center, que vai de 1 até 0.2 em
  // strength=100). Num kernel de convolução, a soma dos pesos determina o
  // brilho resultante — uma soma menor que 1 escurece a imagem
  // sistematicamente. Era exatamente o "nitidez deixa o vídeo escuro"
  // reportado. A fórmula correta de unsharp mask mantém a soma sempre
  // igual a 1 em qualquer intensidade: center = 1 + 4*amount,
  // edge = -amount → soma = (1 + 4*amount) + 8*(-amount) ... não fecha
  // para kernel 3x3 com só 8 vizinhos: soma = center + 8*edge deve ser 1.
  // Com edge = -amount e center = 1 + 8*amount, soma = 1 + 8*amount -
  // 8*amount = 1, constante para qualquer amount. É essa a relação usada
  // abaixo.
  const amount = (strength / 100) * 0.15; // teto testado para não saturar bordas
  const center = 1 + 8 * amount;
  const edge = -amount;

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

  // Denoise seletivo real — testado visualmente em 3 iterações até
  // acertar a composição (histórico abaixo porque a técnica é sutil e
  // fácil de quebrar de novo se mexida sem entender o motivo de cada
  // etapa):
  //
  // v1 (feComposite arithmetic para inverter a máscara): a transição
  //   suave da máscara deixava blur vazar visivelmente nas bordas —
  //   texto/contornos ficavam perceptivelmente mais moles.
  // v2 (feMerge com máscara suave linear): mesmo problema, o vazamento
  //   piorou porque a curva linear dá peso demais à faixa intermediária.
  // v3 (ATUAL): a chave foi trocar a curva suave por uma curva quase-
  //   degrau (feFuncA discrete, tableValues 0 0 0 1 1 1) ANTES de
  //   suavizar, e usar feMorphology dilate para engordar a região
  //   protegida antes do blur final da máscara — isso garante uma
  //   margem de segurança ao redor de cada borda real, então mesmo a
  //   suavização subsequente da máscara não deixa blur vazar para dentro
  //   da região do texto/contorno. Confirmado visualmente: texto e
  //   contornos ficam ~indistinguíveis do original, e banding em degradê
  //   (testado com steps discretos simulando compressão) fica visivelmente
  //   mais suave.
  const blurAmount = (strength / 100) * 2.5;

  return (
    <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <filter id={id} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          {/* 1. Detecta bordas: converte para cinza, aplica Laplaciano
              (sensível a variação em qualquer direção). */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    1 0"
            result="grayscale"
          />
          <feConvolveMatrix
            in="grayscale"
            order="3"
            kernelMatrix="0 -1 0 -1 4 -1 0 -1 0"
            divisor="1"
            bias="0"
            edgeMode="duplicate"
            preserveAlpha="true"
            result="edgeMap"
          />
          {/* 2. Extrai a intensidade da borda como canal alpha de uma
              máscara, com uma curva quase-degrau: qualquer variação
              detectável já conta como "é borda, proteger" — evita que
              bordas fracas fiquem "meio protegidas" (que é o que causava
              vazamento nas versões anteriores). */}
          <feColorMatrix
            in="edgeMap"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.5 0.5 0.5 0 0"
            result="edgeAlpha"
          />
          <feComponentTransfer in="edgeAlpha" result="edgeMaskHard">
            <feFuncA type="discrete" tableValues="0 0 0 1 1 1" />
          </feComponentTransfer>
          {/* 3. Engorda a região protegida antes de suavizar a borda da
              máscara — dá margem de segurança para a suavização do passo
              seguinte não comer para dentro da área de borda real. */}
          <feMorphology in="edgeMaskHard" operator="dilate" radius="1.5" result="edgeMaskDilated" />
          <feGaussianBlur in="edgeMaskDilated" stdDeviation="1" result="edgeMaskFinal" />

          {/* 4. Versão borrada (o denoise em si) + composição: original
              nítido onde a máscara protege, borrado no resto. */}
          <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmount} result="blurred" />
          <feComposite in="blurred" in2="edgeMaskFinal" operator="out" result="blurredWhereNotEdge" />
          <feComposite in="SourceGraphic" in2="edgeMaskFinal" operator="in" result="sharpWhereEdge" />
          <feMerge>
            <feMergeNode in="blurredWhereNotEdge" />
            <feMergeNode in="sharpWhereEdge" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
