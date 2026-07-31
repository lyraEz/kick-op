import { useEffect, useRef, useState, useCallback } from 'react';

const IDLE_DELAY = 3000;

export function useIdleControls(paused = false) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      clearTimeout(timerRef.current);
      setVisible(true);
    } else {
      // ao despausar, reinicia a contagem do zero
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), IDLE_DELAY);
    }
  }, [paused]);

  const show = useCallback(() => {
    setVisible(true);
    clearTimeout(timerRef.current);
    if (!pausedRef.current) {
      timerRef.current = setTimeout(() => setVisible(false), IDLE_DELAY);
    }
  }, []);

  const hide = useCallback(() => {
    if (pausedRef.current) return;
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  const toggle = useCallback(() => {
    if (visible) {
      hide();
    } else {
      show();
    }
  }, [visible, show, hide]);

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(false), IDLE_DELAY);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { visible, show, hide, toggle };
}
