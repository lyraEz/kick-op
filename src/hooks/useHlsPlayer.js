import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

export function useHlsPlayer(videoRef, src) {
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]); // [{index, height, bitrate, isSource}]
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = auto
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setStatus('loading');
    setErrorMessage(null);
    setCurrentLevel(-1);

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

      return () => {
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
      return () => {
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

  return { levels, currentLevel, changeLevel, status, errorMessage };
}
