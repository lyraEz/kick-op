import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Info, ExternalLink, RotateCw } from 'lucide-react';
import './ChatPanel.css';

const LOAD_TIMEOUT = 7000;

export default function ChatPanel({ channelSlug, open, onToggle, controlsVisible }) {
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [loadState, setLoadState] = useState('loading'); // loading | loaded | timeout
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef(null);

  const popoutUrl = `https://kick.com/popout/${channelSlug}/chat`;

  useEffect(() => {
    if (!channelSlug) return;
    setLoadState('loading');
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoadState((current) => (current === 'loading' ? 'timeout' : current));
    }, LOAD_TIMEOUT);
    return () => clearTimeout(timeoutRef.current);
  }, [channelSlug, reloadKey]);

  const retry = () => {
    setReloadKey((k) => k + 1);
  };

  if (!channelSlug) return null;

  return (
    <>
      <button
        className={`chat-toggle glass glass-btn ${
          open ? 'glass-btn--active' : ''
        } ${controlsVisible ? '' : 'chat-toggle--hidden'}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={open ? 'Fechar chat' : 'Abrir chat'}
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
      </button>

      <aside
        className={`chat-panel glass glass--overlay ${open ? 'chat-panel--open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="chat-panel__header">
          <span>Chat</span>
          <a
            className="chat-panel__external"
            href={popoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir chat em nova aba"
          >
            <ExternalLink size={13} />
          </a>
        </header>

        {noticeOpen && (
          <div className="chat-panel__notice">
            <Info size={13} />
            <p>
              Login e envio de mensagem dependem do seu navegador permitir
              cookies de terceiros pra kick.com. Se não carregar, use o atalho
              de abrir em nova aba acima.
            </p>
            <button
              onClick={() => setNoticeOpen(false)}
              aria-label="Dispensar aviso"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {loadState === 'timeout' && (
          <div className="chat-panel__fallback">
            <p>
              O chat embutido não respondeu. Pode ser bloqueio de cookies de
              terceiros do seu navegador.
            </p>
            <button className="chat-panel__retry" onClick={retry}>
              <RotateCw size={13} /> Tentar de novo
            </button>
            <a
              className="chat-panel__retry chat-panel__retry--link"
              href={popoutUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={13} /> Abrir em nova aba
            </a>
          </div>
        )}

        {/* Sempre montado (não só quando "open") pra não recarregar o chat
            toda vez que o usuário minimiza e abre de novo. O painel fica
            só visualmente escondido (ver .chat-panel / visibility no CSS). */}
        <iframe
          key={reloadKey}
          className="chat-panel__frame"
          style={{ display: loadState === 'timeout' ? 'none' : 'block' }}
          src={popoutUrl}
          title="Chat da live"
          onLoad={() => {
            clearTimeout(timeoutRef.current);
            setLoadState('loaded');
          }}
        />
      </aside>
    </>
  );
}
