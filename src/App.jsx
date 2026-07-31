import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import Player from './components/Player';

// Em produção (Vercel), /api/resolve é servido pela função serverless.
// Em dev local sem Vercel CLI, defina VITE_API_BASE apontando pra um deploy existente.
const API_BASE = import.meta.env.VITE_API_BASE || '';

function App() {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (input) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/resolve?slug=${encodeURIComponent(input)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Não foi possível carregar esse canal.');
        return;
      }

      if (!data.isLive || !data.playbackUrl) {
        setError(`${data.displayName} não está ao vivo agora.`);
        return;
      }

      setChannel(data);
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (channel) {
    return <Player channel={channel} onBack={() => setChannel(null)} />;
  }

  return <HomeScreen onSubmit={handleSubmit} loading={loading} error={error} />;
}

export default App;
