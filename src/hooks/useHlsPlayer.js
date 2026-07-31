import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

export function useHlsPlayer(videoRef, src) {
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]); // [{index, height, bitrate}]
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = auto
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setStatus('loading');
    setErrorMessage(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        const parsedLevels = data.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          bitrate: lvl.bitrate,
        }));
        setLevels(parsedLevels);
        setStatus('ready');
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          setStatus('error');
          setErrorMessage('Não foi possível carregar a transmissão.');
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari nativo (iOS) — sem controle de qualidade manual, mas funciona
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
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentLevel(index);
    }
  }, []);

  return { levels, currentLevel, changeLevel, status, errorMessage };
}
