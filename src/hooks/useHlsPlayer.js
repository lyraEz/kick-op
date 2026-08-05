import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

const LIVE_DRIFT_THRESHOLD = 6; // segundos atrás do edge pra considerar "atrasado"

export function useHlsPlayer(videoRef, src) {
  const hlsRef = useRef(null);
  const prevFrameStatsRef = useRef({ frames: 0, time: 0 });
  const [levels, setLevels] = useState([]); // [{index, height, bitrate, isSource}]
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = auto
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBehindLive, setIsBehindLive] = useState(false);
  const [stats, setStats] = useState({
    bitrateKbps: null,
    bufferSeconds: null,
    droppedFrames: null,
    totalFrames: null,
    resolution: null,
    fps: null,
    latencyMs: null,
    codec: null,
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

        // Nem todo manifest da Kick preenche width/height no nível do HLS —
        // quando isso falta, cai para as dimensões reais decodificadas pelo
        // próprio elemento <video>, que sempre existem uma vez que o
        // primeiro frame já foi pintado.
        const resWidth = activeLevel?.width || video.videoWidth || null;
        const resHeight = activeLevel?.height || video.videoHeight || null;

        // FPS real: a API só dá o total acumulado de frames decodificados,
        // então o valor "por segundo" precisa ser calculado como a
        // diferença entre duas leituras, dividida pelo tempo entre elas —
        // não existe um campo pronto de "fps atual".
        let fps = null;
        if (quality) {
          const now = performance.now();
          const prev = prevFrameStatsRef.current;
          const frameDelta = quality.totalVideoFrames - prev.frames;
          const timeDeltaSec = (now - prev.time) / 1000;
          if (prev.time > 0 && timeDeltaSec > 0) {
            fps = Math.round(frameDelta / timeDeltaSec);
          }
          prevFrameStatsRef.current = { frames: quality.totalVideoFrames, time: now };
        }

        setStats({
          bitrateKbps: activeLevel ? Math.round(activeLevel.bitrate / 1000) : null,
          bufferSeconds: bufferSeconds != null ? Math.max(0, bufferSeconds) : null,
          droppedFrames: quality ? quality.droppedVideoFrames : null,
          totalFrames: quality ? quality.totalVideoFrames : null,
          resolution: resWidth && resHeight ? `${resWidth}×${resHeight}` : null,
          fps,
          latencyMs: hls.latency != null ? Math.round(hls.latency * 1000) : null,
          codec: activeLevel?.videoCodec || null,
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
