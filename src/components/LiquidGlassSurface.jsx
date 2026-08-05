import { useLiquidGlassSupport } from '../hooks/useLiquidGlassSupport';
import './LiquidGlass.css';

// Envolve qualquer conteúdo com o efeito de vidro líquido real
// (feDisplacementMap) quando o navegador suporta backdrop-filter com SVG
// filter (hoje: só Chrome/Chromium — ver useLiquidGlassSupport). Fora
// disso, cai para o sistema .glass tradicional (blur puro via
// backdrop-filter), que já funciona em todos os navegadores.
export default function LiquidGlassSurface({
  as: Component = 'div',
  className = '',
  children,
  ...rest
}) {
  const supportsRefraction = useLiquidGlassSupport();

  const classes = [
    'liquid-glass-surface',
    supportsRefraction ? 'liquid-glass-surface--refractive' : 'glass',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
