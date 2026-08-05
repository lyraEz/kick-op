import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Maximize, Minimize } from 'lucide-react';
import MiniPlayer from './MiniPlayer';
import ChatPanel from './ChatPanel';
import './MultiStream.css';

// Multistream fica em 2 slots por design (ver brief): mais que isso não é
// realista em celular médio, decodificar 3-4 HLS simultâneos aquece e
// consome bateria rápido demais para valer a pena.
export default function MultiStream({ onBack }) {
  const containerRef = useRef(null);
  const [slots, setSlots] = useState([null, null]);
  const [audioSlot, setAudioSlot] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatSlot, setActiveChatSlot] = useState(0);
  const [addingSlot, setAddingSlot] = useState(null);
  const [formStream, setFormStream] = useState('');
  const [formChannel, setFormChannel] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const filledSlots = slots.filter(Boolean);
  const channelOptions = filledSlots.map((s) => s.channelSlug);

  const openAddForm = (index) => {
    setAddingSlot(index);
    setFormStream('');
    setFormChannel('');
  };

  const confirmAdd = (e) => {
    e.preventDefault();
    if (!formStream.trim() || !formChannel.trim()) return;
    const next = [...slots];
    next[addingSlot] = {
      playbackUrl: formStream.trim(),
      channelSlug: formChannel.trim().toLowerCase(),
      displayName: formChannel.trim().toLowerCase(),
    };
    setSlots(next);
    setAddingSlot(null);
  };

  const removeSlot = (index) => {
    const next = [...slots];
    next[index] = null;
    setSlots(next);
    if (audioSlot === index) {
      const otherIndex = index === 0 ? 1 : 0;
      setAudioSlot(next[otherIndex] ? otherIndex : index);
    }
  };

  return (
    <div className="multistream" ref={containerRef}>
      <header className="multistream__header glass">
        <button
          className="glass-btn"
          onClick={onBack}
          aria-label="Voltar"
          style={{ background: 'transparent', border: 'none' }}
        >
          <ArrowLeft size={18} />
        </button>
        <span className="multistream__title">2 lives ao mesmo tempo</span>
        <button
          className="glass-btn multistream__fullscreen-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          style={{ background: 'transparent', border: 'none' }}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </header>

      <div className="multistream__grid">
        {slots.map((channel, index) =>
          channel ? (
            <div className="multistream__slot" key={index}>
              <MiniPlayer
                channel={channel}
                hasAudio={audioSlot === index}
                onRequestAudio={() => setAudioSlot(index)}
                onRemove={() => removeSlot(index)}
              />
            </div>
          ) : (
            <button
              key={index}
              className="multistream__empty-slot glass"
              onClick={() => openAddForm(index)}
            >
              <Plus size={22} />
              <span>Adicionar live</span>
            </button>
          )
        )}
      </div>

      {addingSlot !== null && (
        <div className="multistream__modal-backdrop" onClick={() => setAddingSlot(null)}>
          <form
            className="multistream__modal glass glass--overlay"
            onClick={(e) => e.stopPropagation()}
            onSubmit={confirmAdd}
          >
            <h3>Adicionar live ao slot {addingSlot + 1}</h3>
            <label htmlFor="ms-channel">Canal</label>
            <input
              id="ms-channel"
              type="text"
              placeholder="nome do canal"
              value={formChannel}
              onChange={(e) => setFormChannel(e.target.value)}
              autoFocus
            />
            <label htmlFor="ms-stream">Link do vídeo (.m3u8)</label>
            <input
              id="ms-stream"
              type="text"
              inputMode="url"
              placeholder="https://.../master.m3u8"
              value={formStream}
              onChange={(e) => setFormStream(e.target.value)}
            />
            <button type="submit" disabled={!formStream.trim() || !formChannel.trim()}>
              Adicionar
            </button>
          </form>
        </div>
      )}

      {channelOptions.length > 0 && (
        <ChatPanel
          channelSlug={channelOptions[activeChatSlot] || channelOptions[0]}
          channelOptions={channelOptions}
          onChangeChannel={(slug) => setActiveChatSlot(channelOptions.indexOf(slug))}
          open={chatOpen}
          onToggle={() => setChatOpen((v) => !v)}
          controlsVisible={true}
        />
      )}
    </div>
  );
}
