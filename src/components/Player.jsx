import { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, VolumeX, Play, Pause, Maximize, Minimize } from 'lucide-react';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useIdleControls } from '../hooks/useIdleControls';
import ChatPanel from './ChatPanel';
import VideoControls from './VideoControls';
import './Player.css';

export default function Player({ channel, onBack }) {
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const { levels, currentLevel, changeLevel, status, errorMessage } = useHlsPlayer(
    videoRef,
    channel.playbackUrl
  );

  const { visible: controlsVisible, show: showControls, toggle: toggleControls } =
    useIdleControls();

  const [chatOpen, setChatOpen] = useState(false);
  const [fit, setFit] = useState('contain');
  const [zoom, setZoom] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
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

  const handleStageClick = (e) => {
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
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            filter: `saturate(${saturation}%)`,
          }}
          playsInline
          muted={muted}
          autoPlay
        />

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
            className="back-button"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>

          <VideoControls
            levels={levels}
            currentLevel={currentLevel}
            onChangeLevel={changeLevel}
            fit={fit}
            onChangeFit={setFit}
            zoom={zoom}
            onChangeZoom={setZoom}
            saturation={saturation}
            onChangeSaturation={setSaturation}
          />

          <div className="player-bottombar" onClick={(e) => e.stopPropagation()}>
            <button onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Reproduzir'}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={toggleMute} aria-label={muted ? 'Ativar som' : 'Mutar'}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div className="player-bottombar__info">
              <span className="player-channel-name">{channel.displayName}</span>
              <span className="player-live-badge">
                <span className="player-live-dot" /> AO VIVO
              </span>
            </div>

            <button
              className="player-fullscreen-btn"
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
