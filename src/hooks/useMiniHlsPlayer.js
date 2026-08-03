import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

// Versão enxuta do useHlsPlayer para o modo multistream: só status básico,
// sem drift/goLive/estatísticas/troca manual de qualidade — cada slot já é
// uma tela pequena, não faz sentido replicar o painel de controles inteiro
// por instância. Qualidade fica sempre em auto (o hls.js decide sozinho
// com base no tamanho reduzido do player, o que já é o comportamento certo
// para uma tela menor).
export function useMiniHlsPlayer(videoRef, src) {
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setStatus('loading');
    setErrorMessage(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 30,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('ready');
        video.play().catch(() => {});
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
              setErrorMessage('Não foi possível carregar.');
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
    setErrorMessage('Sem suporte a HLS neste navegador.');
  }, [src, videoRef]);

  return { status, errorMessage };
}
