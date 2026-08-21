import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, RotateCw } from 'lucide-react';
import './ChatPanel.css';

const LOAD_TIMEOUT = 5000;
const AUTO_RELOAD_DELAY = 1500;

export default function ChatPanel({
  channelSlug,
  channelOptions,
  onChangeChannel,
  open,
  onToggle,
  controlsVisible,
}) {
  const [loadState, setLoadState] = useState('loading'); // loading | loaded | timeout
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef(null);
  const autoReloadRef = useRef(null);

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

  // Quando o chat trava (timeout ou a própria página de erro carregando
  // dentro do iframe), recarrega sozinho depois de um instante — o
  // usuário não precisa perceber que sumiu nem clicar em nada. Se
  // recarregar de novo e travar de novo, tenta de novo (o setLoadState
  // no efeito acima reinicia o ciclo a cada reloadKey).
  useEffect(() => {
    if (loadState === 'timeout') {
      clearTimeout(autoReloadRef.current);
      autoReloadRef.current = setTimeout(() => {
        setReloadKey((k) => k + 1);
      }, AUTO_RELOAD_DELAY);
    }
    return () => clearTimeout(autoReloadRef.current);
  }, [loadState]);

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
          {channelOptions && channelOptions.length > 1 ? (
            <div className="chat-panel__channel-switch">
              {channelOptions.map((slug) => (
                <button
                  key={slug}
                  className={`chat-panel__channel-btn ${
                    slug === channelSlug ? 'chat-panel__channel-btn--active' : ''
                  }`}
                  onClick={() => onChangeChannel?.(slug)}
                >
                  {slug}
                </button>
              ))}
            </div>
          ) : (
            <span>Chat</span>
          )}
          <button
            className="chat-panel__external"
            onClick={retry}
            aria-label="Recarregar chat"
            title="Recarregar chat"
          >
            <RotateCw size={13} />
          </button>
        </header>

        {loadState === 'timeout' && (
          <div className="chat-panel__fallback">
            <div className="chat-panel__fallback-spinner" />
            <p>Reconectando o chat…</p>
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
