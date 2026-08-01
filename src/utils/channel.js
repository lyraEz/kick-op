export function extractSlug(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed.toLowerCase();
  try {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return (parts[0] || '').toLowerCase();
  } catch {
    return '';
  }
}
