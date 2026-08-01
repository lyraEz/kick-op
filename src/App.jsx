import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import Player from './components/Player';

function App() {
  const [channel, setChannel] = useState(null);

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

  return <HomeScreen onSubmit={handleSubmit} loading={false} error={null} />;
}

export default App;
