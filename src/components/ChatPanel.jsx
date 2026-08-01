import { useState } from 'react';
import { MessageCircle, X, Info } from 'lucide-react';
import './ChatPanel.css';

export default function ChatPanel({ channelSlug, open, onToggle, controlsVisible }) {
  const [noticeOpen, setNoticeOpen] = useState(true);

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
        </header>

        {noticeOpen && (
          <div className="chat-panel__notice">
            <Info size={13} />
            <p>
              Login e envio de mensagem dependem do seu navegador permitir
              cookies de terceiros pra kick.com. Se não funcionar, é isso.
            </p>
            <button
              onClick={() => setNoticeOpen(false)}
              aria-label="Dispensar aviso"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Sempre montado (não só quando "open") pra não recarregar o chat
            toda vez que o usuário minimiza e abre de novo. O painel fica
            só visualmente escondido (ver .chat-panel / visibility no CSS). */}
        <iframe
          className="chat-panel__frame"
          src={`https://kick.com/popout/${channelSlug}/chat`}
          title="Chat da live"
        />
      </aside>
    </>
  );
}
