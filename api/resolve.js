// Vercel Serverless Function
// Busca dados públicos do canal na Kick (playback_url, chatroom_id, status ao vivo)
// Isso roda no servidor pra evitar bloqueio de CORS/Cloudflare que ocorreria
// se o navegador do usuário chamasse a API da Kick diretamente.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Parâmetro "slug" é obrigatório.' });
  }

  // Aceita tanto um slug puro quanto uma URL completa (kick.com/nome)
  const cleanSlug = extractSlug(slug);

  if (!cleanSlug) {
    return res.status(400).json({ error: 'Não foi possível identificar o canal a partir do link enviado.' });
  }

  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${cleanSlug}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (response.status === 404) {
      return res.status(404).json({ error: 'Canal não encontrado.' });
    }

    if (!response.ok) {
      return res.status(502).json({ error: `A Kick respondeu com erro (${response.status}).` });
    }

    const data = await response.json();

    const livestream = data.livestream;
    const isLive = Boolean(livestream && livestream.is_live);

    const playbackUrl = isLive
      ? livestream.playback_url || data.playback_url || null
      : null;

    return res.status(200).json({
      slug: cleanSlug,
      displayName: data.user?.username || cleanSlug,
      avatar: data.user?.profile_pic || null,
      isLive,
      title: livestream?.session_title || null,
      viewerCount: livestream?.viewer_count ?? null,
      category: livestream?.categories?.[0]?.name || null,
      playbackUrl,
      chatroomId: data.chatroom?.id || null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao consultar a Kick.', details: String(err) });
  }
}

function extractSlug(input) {
  const trimmed = input.trim();

  // Já é um slug simples (sem barras, sem protocolo)
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  try {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    return parts[0].toLowerCase();
  } catch {
    return null;
  }
}
