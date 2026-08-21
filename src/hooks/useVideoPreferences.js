import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'klarity:video-preferences';

const DEFAULTS = {
  fit: 'contain',
  zoom: 100,
  saturation: 100,
  brightness: 100,
  contrast: 100,
  sharpness: 0,
  denoise: 0,
  activePreset: 'natural',
  volume: 100,
  speed: 1,
  mirrored: false,
  audioOnly: false,
  autoSync: false,
  statsVisible: false,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    // mescla com DEFAULTS pra cobrir o caso de uma versão anterior ter
    // salvo menos campos do que a atual espera (evita undefined em
    // preferências novas adicionadas depois desta primeira versão)
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function save(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage indisponível (modo privado etc.) — segue sem persistir
  }
}

// Preferências de vídeo (imagem, volume, comportamento) persistidas entre
// sessões — aplicam-se a qualquer stream que o usuário abrir depois, não
// são por canal. Debounced na escrita: sliders disparam várias mudanças
// por segundo enquanto o usuário arrasta, e gravar no localStorage a
// cada uma delas é desperdício.
export function useVideoPreferences() {
  const [prefs, setPrefs] = useState(load);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(prefs), 300);
    return () => clearTimeout(saveTimerRef.current);
  }, [prefs]);

  const update = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateMany = useCallback((patch) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  return { prefs, update, updateMany };
}
