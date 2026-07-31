import { useEffect, useRef, useState, useCallback } from 'react';

const IDLE_DELAY = 3000;

export function useIdleControls() {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  const show = useCallback(() => {
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), IDLE_DELAY);
  }, []);

  const hide = useCallback(() => {
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
  }, []);

  return { visible, show, hide, toggle };
}
