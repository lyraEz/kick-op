import { useState, useMemo } from 'react';
import {
  ArrowRight,
  Radio,
  ChevronDown,
  Check,
  Star,
  History,
  Tag,
  Rows,
} from 'lucide-react';
import { extractSlug } from '../utils/channel';
import { useChannelHistory } from '../hooks/useChannelHistory';
import LiquidGlassFilterDefs from './LiquidGlassFilterDefs';
import LiquidGlassSurface from './LiquidGlassSurface';
import './HomeScreen.css';

export default function HomeScreen({ onSubmit, loading, error, onOpenMultiStream }) {
  const [channelInput, setChannelInput] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);

  const { recent, favorites, addRecent, toggleFavorite, isFavorite } = useChannelHistory();

  const slug = useMemo(() => extractSlug(channelInput), [channelInput]);
  const slugValid = channelInput.trim().length > 0 && Boolean(slug);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!streamUrl.trim() || !slug) return;
    addRecent(slug);
    onSubmit({
      streamUrl: streamUrl.trim(),
      channelSlug: slug,
      channelName: slug,
      title: title.trim() || null,
      category: category.trim() || null,
    });
  };

  const pickChannel = (pickedSlug) => {
    setChannelInput(pickedSlug);
    document.getElementById('stream-url')?.focus();
  };

  const savedChannels = useMemo(() => {
    const favSet = new Set(favorites);
    const others = recent.filter((s) => !favSet.has(s));
    return [...favorites.map((s) => ({ slug: s, fav: true })), ...others.map((s) => ({ slug: s, fav: false }))];
  }, [recent, favorites]);

  return (
    <div className="home">
      <LiquidGlassFilterDefs />
      <div className="home__glow" />
      <div className="home__glow home__glow--secondary" />

      <div className="home__content">
        <div className="home__mark home__enter" style={{ '--delay': '0ms' }}>
          <Radio size={20} strokeWidth={2.4} />
          <span>sinal</span>
        </div>

        <h1 className="home__title home__enter" style={{ '--delay': '60ms' }}>
          Cole o link da live.
          <br />
          <span className="home__title-accent">Assista sem travar.</span>
        </h1>

        <p className="home__subtitle home__enter" style={{ '--delay': '120ms' }}>
          Player próprio, sem o peso da página da Kick. Qualidade, zoom, saturação e
          chat do seu jeito.
        </p>

        {savedChannels.length > 0 && (
          <div className="home__chips home__enter" style={{ '--delay': '160ms' }}>
            {savedChannels.map(({ slug: s, fav }) => (
              <LiquidGlassSurface
                as="button"
                key={s}
                type="button"
                className="home__chip"
                onClick={() => pickChannel(s)}
              >
                {fav ? <Star size={12} className="home__chip-icon--fav" /> : <History size={12} />}
                {s}
              </LiquidGlassSurface>
            ))}
          </div>
        )}

        <form
          className="home__form-stack home__enter"
          style={{ '--delay': '200ms' }}
          onSubmit={handleSubmit}
        >
          <div className="home__field">
            <label htmlFor="channel-input">Canal (link ou nome de usuário)</label>
            <div className="home__input-row">
              <div className="home__input-wrap glass">
                <input
                  id="channel-input"
                  name="channelInput"
                  type="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="kick.com/coringa ou coringa"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="home__input"
                />
                {slugValid && (
                  <span className="home__input-check">
                    <Check size={15} />
                  </span>
                )}
              </div>
              {slugValid && (
                <LiquidGlassSurface
                  as="button"
                  type="button"
                  className={`home__fav-btn glass-btn ${isFavorite(slug) ? 'glass-btn--active' : ''}`}
                  onClick={() => toggleFavorite(slug)}
                  aria-label={isFavorite(slug) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Star size={16} fill={isFavorite(slug) ? 'currentColor' : 'none'} />
                </LiquidGlassSurface>
              )}
            </div>
          </div>

          <div className="home__field">
            <label htmlFor="stream-url">Link do vídeo (.m3u8)</label>
            <input
              id="stream-url"
              name="streamUrl"
              type="text"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="https://.../master.m3u8"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="home__input home__input--standalone glass"
            />
          </div>

          <button
            type="button"
            className="home__details-toggle"
            onClick={() => setDetailsOpen((v) => !v)}
          >
            <Tag size={12} />
            {detailsOpen ? 'Ocultar título e categoria' : 'Adicionar título e categoria (opcional)'}
          </button>

          {detailsOpen && (
            <div className="home__details">
              <div className="home__field">
                <label htmlFor="live-title">Título da live</label>
                <input
                  id="live-title"
                  name="title"
                  type="text"
                  placeholder="ex: só resenha hoje"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="home__input home__input--standalone glass"
                />
              </div>
              <div className="home__field">
                <label htmlFor="live-category">Categoria / jogo</label>
                <input
                  id="live-category"
                  name="category"
                  type="text"
                  placeholder="ex: Just Chatting"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="home__input home__input--standalone glass"
                />
              </div>
              <p className="home__details-hint">
                A Kick bloqueia a busca automática desses dados, então é
                manual — mas fica salvo só nesta sessão, pra aparecer no
                player.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="home__submit-full"
            disabled={loading || !streamUrl.trim() || !slug}
          >
            {loading ? <span className="home__spinner" /> : <>Assistir <ArrowRight size={16} /></>}
          </button>
        </form>

        {error && <p className="home__error">{error}</p>}

        <div className="home__footer-links home__enter" style={{ '--delay': '240ms' }}>
          <button
            type="button"
            className="home__howto-toggle"
            onClick={() => setHowToOpen((v) => !v)}
          >
            <ChevronDown size={14} className={howToOpen ? 'is-open' : ''} />
            Como pegar o link do vídeo
          </button>

          <button type="button" className="home__howto-toggle" onClick={onOpenMultiStream}>
            <Rows size={14} />
            Assistir 2 lives juntas
          </button>
        </div>

        {howToOpen && (
          <ol className="home__howto">
            <li>Abra a live no site da Kick pelo navegador e dê play.</li>
            <li>
              Abra o DevTools (menu do navegador → mais ferramentas → ferramentas
              do desenvolvedor, ou aperte F12 no computador).
            </li>
            <li>
              Vá na aba <strong>Rede/Network</strong> e filtre por{' '}
              <strong>m3u8</strong>.
            </li>
            <li>
              Copie a URL que termina em <strong>master.m3u8</strong> e cole
              no campo acima.
            </li>
            <li>
              O chat não precisa de nenhum link separado — só o nome do canal,
              que já é usado automaticamente.
            </li>
            <li>
              O link do vídeo expira depois de um tempo, então salvar o canal
              (☆) só adianta preencher o nome — o link mesmo sempre precisa
              ser colado na hora.
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}
