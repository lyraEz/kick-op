import { useEffect, useRef, useState, useCallback } from 'react';

// Kick usa Pusher para o chat. Chave pública, mesma usada pelo site oficial.
const PUSHER_KEY = '32cbd69e4b950bf97679';
const PUSHER_CLUSTER = 'us2';
const MAX_MESSAGES = 200;

export function useKickChat(chatroomId) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const clear = useCallback(() => setMessages([]), []);

  useEffect(() => {
    if (!chatroomId) return;

    let closedByUs = false;

    function connect() {
      const ws = new WebSocket(
        `wss://ws-${PUSHER_CLUSTER}.pusher.com/app/${PUSHER_KEY}?protocol=7&client=js&version=8.4.0&flash=false`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(
          JSON.stringify({
            event: 'pusher:subscribe',
            data: { auth: '', channel: `chatrooms.${chatroomId}.v2` },
          })
        );
      };

      ws.onmessage = (raw) => {
        try {
          const payload = JSON.parse(raw.data);
          if (payload.event === 'App\\Events\\ChatMessageEvent') {
            const msg = JSON.parse(payload.data);
            setMessages((prev) => {
              const next = [
                ...prev,
                {
                  id: msg.id,
                  username: msg.sender?.username || 'anon',
                  color: msg.sender?.identity?.color || '#8b8b8b',
                  content: msg.content,
                  badges: msg.sender?.identity?.badges || [],
                },
              ];
              return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
            });
          }
        } catch {
          // ignora eventos que não são mensagens de chat (pings, etc.)
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closedByUs) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      setMessages([]);
    };
  }, [chatroomId]);

  return { messages, connected, clear };
}
