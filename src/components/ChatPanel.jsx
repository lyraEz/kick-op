import { useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useKickChat } from '../hooks/useKickChat';
import './ChatPanel.css';

export default function ChatPanel({ chatroomId, open, onToggle, controlsVisible }) {
  const { messages, status, connected } = useKickChat(chatroomId);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chatroomId) return null;

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
          <span className={`chat-panel__dot ${connected ? 'is-live' : ''}`} />
        </header>

        <div className="chat-panel__messages" ref={scrollRef}>
          {status === 'error' && (
            <p className="chat-panel__empty chat-panel__empty--error">
              Não foi possível entrar nesse chat. Confira se o ID está certo —
              procure por "chatroom" na aba Rede e pegue o número que aparece
              logo depois de <code>chatrooms.</code> na URL do WebSocket.
            </p>
          )}
          {status !== 'error' && messages.length === 0 && (
            <p className="chat-panel__empty">
              {connected ? 'Aguardando mensagens…' : 'Conectando ao chat…'}
            </p>
          )}
          {messages.map((msg) => (
            <p key={msg.id} className="chat-panel__message">
              <span className="chat-panel__username" style={{ color: msg.color }}>
                {msg.username}
              </span>
              <span className="chat-panel__content">: {msg.content}</span>
            </p>
          ))}
        </div>
      </aside>
    </>
  );
}
