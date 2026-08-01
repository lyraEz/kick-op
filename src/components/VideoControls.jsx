import { Settings, X, Activity } from 'lucide-react';
import { PRESETS } from '../constants/presets';
import './VideoControls.css';

const FIT_OPTIONS = [
  { value: 'contain', label: 'Original', hint: 'sem cortes' },
  { value: 'fill', label: 'Esticado', hint: 'preenche sem cortar' },
];

const SPEED_OPTIONS = [1, 1.1, 1.25, 1.5];

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
  volume,
  onChangeVolume,
  speed,
  onChangeSpeed,
  mirrored,
  onToggleMirror,
  audioOnly,
  onToggleAudioOnly,
  autoSync,
  onToggleAutoSync,
  statsVisible,
  onToggleStats,
  stats,
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
            <button
              className={`chip ${mirrored ? 'chip--active' : ''}`}
              onClick={onToggleMirror}
            >
              Espelhar
            </button>
          </div>
        </section>

        <section className="settings-group">
          <h3>Velocidade</h3>
          <div className="settings-chips">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                className={`chip ${speed === s ? 'chip--active' : ''}`}
                onClick={() => onChangeSpeed(s)}
              >
                {s === 1 ? 'Normal' : `${s}×`}
              </button>
            ))}
          </div>
          <p className="settings-hint">
            Acima de 1× ajuda a alcançar o ao vivo mais rápido sem cortar.
          </p>
        </section>

        <section className="settings-group">
          <h3>Presets de imagem</h3>
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
            <h3>Volume</h3>
            <span className="settings-value">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onChangeVolume(Number(e.target.value))}
            className="slider"
          />
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

        <section className="settings-group">
          <h3>Modo</h3>
          <div className="settings-chips">
            <button
              className={`chip ${audioOnly ? 'chip--active' : ''}`}
              onClick={onToggleAudioOnly}
            >
              Modo economia
              <span className="chip__hint">força qualidade mínima</span>
            </button>
            <button
              className={`chip ${autoSync ? 'chip--active' : ''}`}
              onClick={onToggleAutoSync}
            >
              Auto-sincronizar
              <span className="chip__hint">volta ao vivo sozinho</span>
            </button>
            <button
              className={`chip ${statsVisible ? 'chip--active' : ''}`}
              onClick={onToggleStats}
            >
              <Activity size={11} style={{ marginRight: 3 }} />
              Estatísticas
            </button>
          </div>
        </section>

        {statsVisible && (
          <section className="settings-group settings-stats">
            <h3>Estatísticas técnicas</h3>
            <dl className="stats-list">
              <div>
                <dt>Resolução</dt>
                <dd>{stats.resolution || '—'}</dd>
              </div>
              <div>
                <dt>Bitrate</dt>
                <dd>{stats.bitrateKbps ? `${stats.bitrateKbps} kbps` : '—'}</dd>
              </div>
              <div>
                <dt>Buffer</dt>
                <dd>{stats.bufferSeconds != null ? `${stats.bufferSeconds.toFixed(1)}s` : '—'}</dd>
              </div>
              <div>
                <dt>Frames perdidos</dt>
                <dd>{stats.droppedFrames ?? '—'}</dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </>
  );
}
