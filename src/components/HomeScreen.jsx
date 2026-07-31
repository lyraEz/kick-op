import { useState } from 'react';
import { ArrowRight, Radio, ChevronDown } from 'lucide-react';
import './HomeScreen.css';

export default function HomeScreen({ onSubmit, loading, error }) {
  const [streamUrl, setStreamUrl] = useState('');
  const [channelName, setChannelName] = useState('');
  const [chatroomId, setChatroomId] = useState('');
  const [howToOpen, setHowToOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (streamUrl.trim()) {
      onSubmit({
        streamUrl: streamUrl.trim(),
        channelName: channelName.trim() || 'canal',
        chatroomId: chatroomId.trim() || null,
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
          Cole o link do stream.
          <br />
          <span className="home__title-accent">Assista sem travar.</span>
        </h1>

        <p className="home__subtitle">
          Player próprio, sem o peso da página da Kick. Qualidade, zoom, saturação e
          chat do seu jeito.
        </p>

        <form className="home__form-stack" onSubmit={handleSubmit}>
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

          <div className="home__field">
            <label htmlFor="channel-name">Nome do canal (opcional)</label>
            <input
              id="channel-name"
              name="channelName"
              type="text"
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="ex: coringa"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="home__input"
            />
          </div>

          <div className="home__field">
            <label htmlFor="chatroom-id">ID do chat (opcional)</label>
            <input
              id="chatroom-id"
              name="chatroomId"
              type="text"
              inputMode="numeric"
              placeholder="deixe em branco pra assistir sem chat"
              value={chatroomId}
              onChange={(e) => setChatroomId(e.target.value)}
              className="home__input"
            />
          </div>

          <button type="submit" className="home__submit-full" disabled={loading || !streamUrl.trim()}>
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
          Como pegar esses links
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
              aqui em cima.
            </li>
            <li>
              Pro ID do chat: na mesma aba de Rede, filtre por{' '}
              <strong>pusher</strong> ou <strong>websocket</strong> (WS). Vai
              aparecer uma conexão pra <strong>ws-us2.pusher.com</strong> —
              clique nela, vá na aba de mensagens e procure por{' '}
              <strong>chatrooms.NÚMERO.v2</strong>. É esse número.
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}
