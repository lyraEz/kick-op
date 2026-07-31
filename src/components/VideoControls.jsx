import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import './VideoControls.css';

const FIT_OPTIONS = [
  { value: 'contain', label: 'Original', hint: 'sem cortes' },
  { value: 'cover', label: 'Esticado', hint: 'preenche a tela' },
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
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`settings-toggle ${open ? 'settings-toggle--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Configurações de vídeo"
      >
        {open ? <X size={18} /> : <Settings size={18} />}
      </button>

      <div className={`settings-panel ${open ? 'settings-panel--open' : ''}`}>
        <section className="settings-group">
          <h3>Qualidade</h3>
          <div className="settings-chips">
            <button
              className={`chip ${currentLevel === -1 ? 'chip--active' : ''}`}
              onClick={() => onChangeLevel(-1)}
            >
              Auto
            </button>
            {[...levels]
              .sort((a, b) => b.height - a.height)
              .map((lvl) => (
                <button
                  key={lvl.index}
                  className={`chip ${currentLevel === lvl.index ? 'chip--active' : ''}`}
                  onClick={() => onChangeLevel(lvl.index)}
                >
                  {lvl.height}p
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
      </div>
    </>
  );
}
