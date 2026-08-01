import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

const LIVE_DRIFT_THRESHOLD = 6; // segundos atrás do edge pra considerar "atrasado"

export function useHlsPlayer(videoRef, src) {
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]); // [{index, height, bitrate, isSource}]
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = auto
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBehindLive, setIsBehindLive] = useState(false);
  const [stats, setStats] = useState({
    bitrateKbps: null,
    bufferSeconds: null,
    droppedFrames: null,
    resolution: null,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setStatus('loading');
    setErrorMessage(null);
    setCurrentLevel(-1);
    setIsBehindLive(false);

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 60,
        capLevelToPlayerSize: false,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        const maxBitrate = Math.max(...data.levels.map((l) => l.bitrate));
        const parsedLevels = data.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          bitrate: lvl.bitrate,
          isSource: lvl.bitrate === maxBitrate,
        }));
        parsedLevels.sort((a, b) => b.height - a.height);
        setLevels(parsedLevels);
        setStatus('ready');
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_evt, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setStatus('error');
              setErrorMessage('Não foi possível carregar a transmissão.');
          }
        }
      });

      // Verifica periodicamente a distância entre onde o player está e o
      // "ao vivo de verdade" (liveSyncPosition) — cobre tanto pausa quanto
      // atraso de buffer acumulado sem o usuário ter pausado nada. No mesmo
      // intervalo, também atualiza as estatísticas técnicas do painel.
      const driftCheck = setInterval(() => {
        const syncPos = hls.liveSyncPosition;
        if (syncPos == null || video.paused) {
          if (video.paused) setIsBehindLive(true);
        } else {
          const drift = syncPos - video.currentTime;
          setIsBehindLive(drift > LIVE_DRIFT_THRESHOLD);
        }

        const activeLevel = hls.levels[hls.currentLevel];
        const buffered = video.buffered;
        const bufferSeconds =
          buffered.length > 0 ? buffered.end(buffered.length - 1) - video.currentTime : null;
        const quality = video.getVideoPlaybackQuality?.();

        setStats({
          bitrateKbps: activeLevel ? Math.round(activeLevel.bitrate / 1000) : null,
          bufferSeconds: bufferSeconds != null ? Math.max(0, bufferSeconds) : null,
          droppedFrames: quality ? quality.droppedVideoFrames : null,
          resolution: activeLevel ? `${activeLevel.width}×${activeLevel.height}` : null,
        });
      }, 2000);

      return () => {
        clearInterval(driftCheck);
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setStatus('ready');
        video.play().catch(() => {});
      });

      const driftCheck = setInterval(() => {
        const seekable = video.seekable;
        if (seekable.length === 0 || video.paused) {
          if (video.paused) setIsBehindLive(true);
          return;
        }
        const edge = seekable.end(seekable.length - 1);
        setIsBehindLive(edge - video.currentTime > LIVE_DRIFT_THRESHOLD);
      }, 2000);

      return () => {
        clearInterval(driftCheck);
        video.src = '';
      };
    }

    setStatus('error');
    setErrorMessage('Este navegador não suporta reprodução HLS.');
  }, [src, videoRef]);

  const changeLevel = useCallback((index) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = index;
    hlsRef.current.nextLevel = index;
    setCurrentLevel(index);
  }, []);

  const goLive = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current?.liveSyncPosition != null) {
      video.currentTime = hlsRef.current.liveSyncPosition;
    } else if (video.seekable.length > 0) {
      video.currentTime = video.seekable.end(video.seekable.length - 1);
    }
    video.play().catch(() => {});
    setIsBehindLive(false);
  }, [videoRef]);

  return {
    levels,
    currentLevel,
    changeLevel,
    status,
    errorMessage,
    isBehindLive,
    goLive,
    stats,
  };
}
