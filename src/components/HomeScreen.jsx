import { useState } from 'react';
import { ArrowRight, Radio, ChevronDown } from 'lucide-react';
import './HomeScreen.css';

function extractSlug(input) {
  const trimmed = input.trim();
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

export default function HomeScreen({ onSubmit, loading, error }) {
  const [channelInput, setChannelInput] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [howToOpen, setHowToOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = extractSlug(channelInput);
    if (streamUrl.trim() && slug) {
      onSubmit({
        streamUrl: streamUrl.trim(),
        channelSlug: slug,
        channelName: slug,
      });
    }
  };

  return (
    <div className="home">
      <div className="home__glow" />

      <div className="home__content">
        <div className="home__mark">
          <Radio size={20} strokeWidth={2.4} />
          <span>sinal</span>
        </div>

        <h1 className="home__title">
          Cole o link da live.
          <br />
          <span className="home__title-accent">Assista sem travar.</span>
        </h1>

        <p className="home__subtitle">
          Player próprio, sem o peso da página da Kick. Qualidade, zoom, saturação e
          chat do seu jeito.
        </p>

        <form className="home__form-stack" onSubmit={handleSubmit}>
          <div className="home__field">
            <label htmlFor="channel-input">Canal (link ou nome de usuário)</label>
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
              className="home__input"
            />
          </div>

          <button
            type="submit"
            className="home__submit-full"
            disabled={loading || !streamUrl.trim() || !extractSlug(channelInput)}
          >
            {loading ? <span className="home__spinner" /> : <>Assistir <ArrowRight size={16} /></>}
          </button>
        </form>

        {error && <p className="home__error">{error}</p>}

        <button
          type="button"
          className="home__howto-toggle"
          onClick={() => setHowToOpen((v) => !v)}
        >
          <ChevronDown size={14} className={howToOpen ? 'is-open' : ''} />
          Como pegar o link do vídeo
        </button>

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
          </ol>
        )}
      </div>
    </div>
  );
}
