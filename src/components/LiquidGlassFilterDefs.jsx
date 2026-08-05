import { useMemo } from 'react';
import { getCachedDisplacementMap } from '../utils/liquidGlass';

// Monta a definição do filtro SVG de refração real (feImage +
// feDisplacementMap + feGaussianBlur leve + feSpecularLighting para o
// brilho de borda). É invisível por si só — outros elementos aplicam
// via CSS: filter: url(#liquid-glass-refraction).
//
// Diferente do sistema .glass atual (blur puro via backdrop-filter), isto
// desloca fisicamente os pixels do conteúdo atrás, criando a lente real
// que foi pedida — mas só funciona como backdrop-filter no Chrome; nos
// demais navegadores o elemento cai de volta no .glass tradicional (ver
// LiquidGlassButton.jsx, que decide qual usar).
export default function LiquidGlassFilterDefs({ id = 'liquid-glass-refraction', size = 128 }) {
  const displacementMapUrl = useMemo(() => getCachedDisplacementMap(size, 0.4), [size]);

  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          {/* leve blur na fonte antes de deslocar — suaviza artefatos de
              borda do deslocamento, sem virar um blur genérico */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="softened" />

          <feImage
            href={displacementMapUrl}
            x="0"
            y="0"
            width={size}
            height={size}
            result="displacement_map"
            preserveAspectRatio="none"
          />

          <feDisplacementMap
            in="softened"
            in2="displacement_map"
            scale="34"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />

          {/* brilho especular sutil na borda, simulando luz pegando a
              quina do vidro — reforça a leitura de "lente física" */}
          <feSpecularLighting
            in="displacement_map"
            surfaceScale="3"
            specularConstant="0.65"
            specularExponent="12"
            lightingColor="#ffffff"
            result="specular"
          >
            <feDistantLight azimuth="235" elevation="55" />
          </feSpecularLighting>
          <feComposite in="specular" in2="refracted" operator="in" result="specular_clipped" />
          <feBlend in="refracted" in2="specular_clipped" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
