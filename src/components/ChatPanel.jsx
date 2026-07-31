import { MessageCircle, X } from 'lucide-react';
import './ChatPanel.css';

export default function ChatPanel({ channelSlug, open, onToggle, controlsVisible }) {
  if (!channelSlug) return null;

  return (
    <>
      <button
        className={`chat-toggle ${open ? 'chat-toggle--active' : ''} ${
          controlsVisible ? '' : 'chat-toggle--hidden'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={open ? 'Fechar chat' : 'Abrir chat'}
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
      </button>

      <aside
        className={`chat-panel ${open ? 'chat-panel--open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="chat-panel__header">
          <span>Chat</span>
        </header>

        {open && (
          <iframe
            className="chat-panel__frame"
            src={`https://kick.com/popout/${channelSlug}/chat`}
            title="Chat da live"
            loading="lazy"
          />
        )}
      </aside>
    </>
  );
}
