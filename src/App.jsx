import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import Player from './components/Player';
import MultiStream from './components/MultiStream';

function App() {
  const [channel, setChannel] = useState(null);
  const [view, setView] = useState('home'); // home | multi

  // Quando o usuário clica em "Abrir no Klarity" na extensão, ele chega
  // aqui com ?stream=<m3u8>&channel=<slug> já prontos — inicia direto,
  // sem passar pela Home. A URL é limpa depois pra não deixar o m3u8
  // (que expira e é específico da sessão) preso no histórico do navegador.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const streamUrl = params.get('stream');
    const channelSlug = params.get('channel');

    if (streamUrl && channelSlug) {
      setChannel({
        displayName: channelSlug,
        playbackUrl: streamUrl,
        channelSlug,
        title: null,
        category: null,
        isLive: true,
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = ({ streamUrl, channelName, channelSlug, title, category }) => {
    setChannel({
      displayName: channelName,
      playbackUrl: streamUrl,
      channelSlug,
      title,
      category,
      isLive: true,
    });
  };

  if (channel) {
    return <Player channel={channel} onBack={() => setChannel(null)} />;
  }

  if (view === 'multi') {
    return <MultiStream onBack={() => setView('home')} />;
  }

  return (
    <HomeScreen
      onSubmit={handleSubmit}
      loading={false}
      error={null}
      onOpenMultiStream={() => setView('multi')}
    />
  );
}

export default App;
