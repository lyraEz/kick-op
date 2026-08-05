import { useRef } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { useMiniHlsPlayer } from '../hooks/useMiniHlsPlayer';
import './MiniPlayer.css';

export default function MiniPlayer({ channel, hasAudio, onRequestAudio, onRemove }) {
  const videoRef = useRef(null);
  const { status, errorMessage } = useMiniHlsPlayer(videoRef, channel.playbackUrl);

  return (
    <div className="mini-player">
      <video
        ref={videoRef}
        className="mini-player__video"
        playsInline
        muted={!hasAudio}
        autoPlay
      />

      {status === 'loading' && (
        <div className="mini-player__overlay">
          <div className="mini-player__spinner" />
        </div>
      )}

      {status === 'error' && (
        <div className="mini-player__overlay">
          <p className="mini-player__error">{errorMessage}</p>
        </div>
      )}

      <div className="mini-player__chrome">
        <div className="mini-player__label glass glass--light">
          <span className="player-live-dot" />
          {channel.displayName}
        </div>

        <div className="mini-player__actions">
          <button
            className={`glass glass--light glass-btn glass-btn--sm ${hasAudio ? 'glass-btn--active' : ''}`}
            onClick={onRequestAudio}
            aria-label={hasAudio ? 'Com áudio' : 'Ativar áudio deste stream'}
          >
            {hasAudio ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            className="glass glass--light glass-btn glass-btn--sm"
            onClick={onRemove}
            aria-label="Remover stream"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
