import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'sinal:channels';
const MAX_RECENT = 6;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { recent: [], favorites: [] };
    const parsed = JSON.parse(raw);
    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch {
    return { recent: [], favorites: [] };
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponível (modo privado etc.) — segue sem persistir
  }
}

export function useChannelHistory() {
  const [{ recent, favorites }, setData] = useState(load);

  useEffect(() => {
    save({ recent, favorites });
  }, [recent, favorites]);

  const addRecent = useCallback((slug) => {
    setData((prev) => ({
      ...prev,
      recent: [slug, ...prev.recent.filter((s) => s !== slug)].slice(0, MAX_RECENT),
    }));
  }, []);

  const toggleFavorite = useCallback((slug) => {
    setData((prev) => {
      const isFav = prev.favorites.includes(slug);
      return {
        ...prev,
        favorites: isFav
          ? prev.favorites.filter((s) => s !== slug)
          : [...prev.favorites, slug],
      };
    });
  }, []);

  const isFavorite = useCallback((slug) => favorites.includes(slug), [favorites]);

  return { recent, favorites, addRecent, toggleFavorite, isFavorite };
}
