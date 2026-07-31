import { useRef, useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import ChatPanel from './ChatPanel';
import VideoControls from './VideoControls';
import './Player.css';

export default function Player({ channel, onBack }) {
  const videoRef = useRef(null);
  const { levels, currentLevel, changeLevel, status, errorMessage } = useHlsPlayer(
    videoRef,
    channel.playbackUrl
  );

  const [chatOpen, setChatOpen] = useState(false);
  const [fit, setFit] = useState('contain');
  const [zoom, setZoom] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

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

  return (
    <div className="player-shell">
      <div className="player-stage">
        <video
          ref={videoRef}
          className="player-video"
          style={{
            objectFit: fit,
            transform: `scale(${zoom / 100})`,
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

        <button className="back-button" onClick={onBack} aria-label="Voltar">
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

        <div className="player-bottombar">
          <button onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Reproduzir'}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={toggleMute} aria-label={muted ? 'Ativar som' : 'Mutar'}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <div className="player-bottombar__info">
            <span className="player-channel-name">{channel.displayName}</span>
            {channel.isLive && (
              <span className="player-live-badge">
                <span className="player-live-dot" /> AO VIVO
                {channel.viewerCount != null && ` · ${channel.viewerCount}`}
              </span>
            )}
          </div>
        </div>

        <ChatPanel
          chatroomId={channel.chatroomId}
          open={chatOpen}
          onToggle={() => setChatOpen((v) => !v)}
        />
      </div>
    </div>
  );
}
