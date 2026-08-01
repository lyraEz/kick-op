import { useRef, useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize,
  Minimize,
  PictureInPicture2,
  Radio,
} from 'lucide-react';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useIdleControls } from '../hooks/useIdleControls';
import ChatPanel from './ChatPanel';
import VideoControls from './VideoControls';
import { PRESETS } from '../constants/presets';
import './Player.css';

export default function Player({ channel, onBack }) {
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const {
    levels,
    currentLevel,
    changeLevel,
    status,
    errorMessage,
    isBehindLive,
    goLive,
    stats,
  } = useHlsPlayer(videoRef, channel.playbackUrl);

  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fit, setFit] = useState('contain');
  const [zoom, setZoom] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [activePreset, setActivePreset] = useState('natural');
  const [volume, setVolume] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [mirrored, setMirrored] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  const { visible: controlsVisible, show: showControls, toggle: toggleControls } =
    useIdleControls(settingsOpen || chatOpen);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  useEffect(() => {
    setPipSupported(
      typeof document !== 'undefined' && document.pictureInPictureEnabled
    );
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume / 100;
  }, [volume]);

  // Auto-sincronizar: se ativado, assim que o player detectar que ficou
  // atrás do live edge, volta sozinho sem esperar o usuário clicar.
  useEffect(() => {
    if (autoSync && isBehindLive && playing) {
      goLive();
    }
  }, [autoSync, isBehindLive, playing, goLive]);

  // "Só áudio" não existe de fato num stream HLS sem faixa de áudio
  // separada (a Kick não fornece uma) — a aproximação honesta é forçar a
  // menor qualidade de vídeo disponível, que é o que realmente reduz o
  // consumo de dados, e esconder a imagem visualmente.
  const previousLevelRef = useRef(-1);
  useEffect(() => {
    if (audioOnly) {
      previousLevelRef.current = currentLevel;
      const lowestIndex = levels.reduce(
        (min, lvl) => (lvl.height < levels[min]?.height ? lvl.index : min),
        levels[0]?.index ?? -1
      );
      if (lowestIndex !== -1) changeLevel(lowestIndex);
    } else if (previousLevelRef.current !== undefined) {
      changeLevel(previousLevelRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioOnly]);

  const applyPreset = useCallback((key) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setSaturation(preset.saturation);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setActivePreset(key);
  }, []);

  // Qualquer ajuste manual num slider de imagem tira do preset atual e
  // marca como "Personalizado" — não faz sentido continuar mostrando
  // "Cinema" selecionado se o usuário já mudou o valor.
  const manualChange = (setter) => (value) => {
    setter(value);
    setActivePreset('custom');
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const togglePip = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // navegador recusou (ex: sem suporte real apesar da flag) — ignora
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleGoLive = () => {
    goLive();
    setPlaying(true);
  };

  const handleStageClick = (e) => {
    // Guarda explícita: nunca alterna os controles se algum painel estiver
    // aberto, mesmo que o clique caia numa área "vazia" do stage por trás
    // dele (evita o bug de conseguir mexer nos controles "por baixo" quando
    // o painel está tecnicamente sobreposto mas o clique vaza por CSS).
    if (settingsOpen || chatOpen) return;
    if (e.target === videoRef.current || e.target === stageRef.current) {
      toggleControls();
    }
  };

  return (
    <div className="player-shell">
      <div
        className={`player-stage ${controlsVisible ? '' : 'player-stage--idle'}`}
        ref={stageRef}
        onClick={handleStageClick}
        onMouseMove={showControls}
      >
        <video
          ref={videoRef}
          className="player-video"
          style={{
            objectFit: fit,
            transform: `${zoom !== 100 ? `scale(${zoom / 100}) ` : ''}${
              mirrored ? 'scaleX(-1)' : ''
            }`.trim() || undefined,
            filter: `saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%)`,
          }}
          playsInline
          muted={muted}
          autoPlay
        />

        {audioOnly && status === 'ready' && (
          <div className="player-audio-only-badge glass">
            <Radio size={13} /> Qualidade mínima ativa
          </div>
        )}

        {status === 'loading' && (
          <div className="player-overlay">
            <div className="player-spinner" />
            <p>Conectando à transmissão…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="player-overlay">
            <p className="player-overlay__error">{errorMessage}</p>
          </div>
        )}

        <div className="player-chrome">
          <button
            className="back-button glass glass-btn"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>

          {(channel.title || channel.category) && (
            <div className="player-meta glass" onClick={(e) => e.stopPropagation()}>
              {channel.title && <p className="player-meta__title">{channel.title}</p>}
              {channel.category && <span className="player-meta__tag">{channel.category}</span>}
            </div>
          )}

          {isBehindLive && !autoSync && (
            <button
              className="go-live-btn glass"
              onClick={(e) => {
                e.stopPropagation();
                handleGoLive();
              }}
            >
              <span className="player-live-dot" /> Ir para o AO VIVO
            </button>
          )}

          <VideoControls
            levels={levels}
            currentLevel={currentLevel}
            onChangeLevel={changeLevel}
            fit={fit}
            onChangeFit={setFit}
            zoom={zoom}
            onChangeZoom={manualChange(setZoom)}
            saturation={saturation}
            onChangeSaturation={manualChange(setSaturation)}
            brightness={brightness}
            onChangeBrightness={manualChange(setBrightness)}
            contrast={contrast}
            onChangeContrast={manualChange(setContrast)}
            activePreset={activePreset}
            onApplyPreset={applyPreset}
            volume={volume}
            onChangeVolume={setVolume}
            speed={speed}
            onChangeSpeed={setSpeed}
            mirrored={mirrored}
            onToggleMirror={() => setMirrored((v) => !v)}
            audioOnly={audioOnly}
            onToggleAudioOnly={() => setAudioOnly((v) => !v)}
            autoSync={autoSync}
            onToggleAutoSync={() => setAutoSync((v) => !v)}
            statsVisible={statsVisible}
            onToggleStats={() => setStatsVisible((v) => !v)}
            stats={stats}
            open={settingsOpen}
            onToggle={() => setSettingsOpen((v) => !v)}
          />

          <div className="player-bottombar" onClick={(e) => e.stopPropagation()}>
            <button
              className="glass glass-btn"
              onClick={togglePlay}
              aria-label={playing ? 'Pausar' : 'Reproduzir'}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              className="glass glass-btn"
              onClick={toggleMute}
              aria-label={muted ? 'Ativar som' : 'Mutar'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div className="player-bottombar__info glass">
              <span className="player-channel-name">{channel.displayName}</span>
              <span className="player-live-badge">
                <span className="player-live-dot" /> AO VIVO
              </span>
            </div>

            {pipSupported && (
              <button
                className="glass glass-btn"
                onClick={togglePip}
                aria-label="Picture-in-picture"
              >
                <PictureInPicture2 size={17} />
              </button>
            )}

            <button
              className="player-fullscreen-btn glass glass-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>

        <ChatPanel
          channelSlug={channel.channelSlug}
          open={chatOpen}
          onToggle={() => setChatOpen((v) => !v)}
          controlsVisible={controlsVisible}
        />
      </div>
    </div>
  );
}
