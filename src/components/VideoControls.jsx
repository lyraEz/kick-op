import { Settings, X } from 'lucide-react';
import { PRESETS } from '../constants/presets';
import './VideoControls.css';

const FIT_OPTIONS = [
  { value: 'contain', label: 'Original', hint: 'sem cortes' },
  { value: 'fill', label: 'Esticado', hint: 'preenche sem cortar' },
];

export default function VideoControls({
  levels,
  currentLevel,
  onChangeLevel,
  fit,
  onChangeFit,
  zoom,
  onChangeZoom,
  saturation,
  onChangeSaturation,
  brightness,
  onChangeBrightness,
  contrast,
  onChangeContrast,
  activePreset,
  onApplyPreset,
  open,
  onToggle,
}) {
  return (
    <>
      <button
        className={`settings-toggle glass glass-btn ${
          open ? 'glass-btn--active-warn' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label="Configurações de vídeo"
      >
        {open ? <X size={18} /> : <Settings size={18} />}
      </button>

      <div
        className={`settings-panel glass glass--overlay ${
          open ? 'settings-panel--open' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <section className="settings-group">
          <h3>Qualidade</h3>
          <div className="settings-chips">
            <button
              className={`chip ${currentLevel === -1 ? 'chip--active' : ''}`}
              onClick={() => onChangeLevel(-1)}
            >
              Auto
            </button>
            {levels.map((lvl) => (
              <button
                key={lvl.index}
                className={`chip ${currentLevel === lvl.index ? 'chip--active' : ''}`}
                onClick={() => onChangeLevel(lvl.index)}
              >
                {lvl.isSource ? 'Fonte' : `${lvl.height}p`}
                {lvl.isSource && <span className="chip__hint">{lvl.height}p</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-group">
          <h3>Ajuste de imagem</h3>
          <div className="settings-chips">
            {FIT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`chip ${fit === opt.value ? 'chip--active' : ''}`}
                onClick={() => onChangeFit(opt.value)}
              >
                {opt.label}
                <span className="chip__hint">{opt.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-group">
          <h3>Presets</h3>
          <div className="settings-chips">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={`chip ${activePreset === key ? 'chip--active' : ''}`}
                onClick={() => onApplyPreset(key)}
              >
                {preset.label}
              </button>
            ))}
            {activePreset === 'custom' && (
              <span className="chip chip--custom">Personalizado</span>
            )}
          </div>
        </section>

        <section className="settings-group">
          <div className="settings-row">
            <h3>Zoom</h3>
            <span className="settings-value">{zoom}%</span>
          </div>
          <input
            type="range"
            min="100"
            max="300"
            value={zoom}
            onChange={(e) => onChangeZoom(Number(e.target.value))}
            className="slider"
          />
        </section>

        <section className="settings-group">
          <div className="settings-row">
            <h3>Saturação</h3>
            <span className="settings-value">{saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => onChangeSaturation(Number(e.target.value))}
            className="slider"
          />
        </section>

        <section className="settings-group">
          <div className="settings-row">
            <h3>Brilho</h3>
            <span className="settings-value">{brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => onChangeBrightness(Number(e.target.value))}
            className="slider"
          />
        </section>

        <section className="settings-group">
          <div className="settings-row">
            <h3>Contraste</h3>
            <span className="settings-value">{contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(e) => onChangeContrast(Number(e.target.value))}
            className="slider"
          />
        </section>
      </div>
    </>
  );
}
