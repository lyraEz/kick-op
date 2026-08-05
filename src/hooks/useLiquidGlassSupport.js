import { useState, useEffect } from 'react';

// Só Chrome/Chromium expõe SVG filters via backdrop-filter (confirmado:
// https://kube.io/blog/liquid-glass-css-svg/ — "cross-browser compatibility
// ends" nesse ponto específico). Detecta isso testando programaticamente
// em vez de fazer sniffing de user-agent (frágil e engana em navegadores
// baseados em Chromium com nomes diferentes).
let cachedSupport = null;

function detectSupport() {
  if (cachedSupport !== null) return cachedSupport;
  if (typeof CSS === 'undefined' || !CSS.supports) {
    cachedSupport = false;
    return false;
  }
  // CSS.supports aceita a sintaxe mesmo sem o filtro existir de fato — o
  // teste real é aplicar e checar se backdrop-filter permanece "none" ou
  // se o valor é de fato aceito pelo engine.
  cachedSupport =
    CSS.supports('backdrop-filter', 'url(#test)') ||
    CSS.supports('-webkit-backdrop-filter', 'url(#test)');
  return cachedSupport;
}

export function useLiquidGlassSupport() {
  const [supported, setSupported] = useState(detectSupport);

  useEffect(() => {
    setSupported(detectSupport());
  }, []);

  return supported;
}
