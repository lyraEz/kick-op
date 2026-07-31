import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import Player from './components/Player';

function App() {
  const [channel, setChannel] = useState(null);

  const handleSubmit = ({ streamUrl, channelName, chatroomId }) => {
    setChannel({
      displayName: channelName,
      playbackUrl: streamUrl,
      chatroomId,
      isLive: true,
      viewerCount: null,
    });
  };

  if (channel) {
    return <Player channel={channel} onBack={() => setChannel(null)} />;
  }

  return <HomeScreen onSubmit={handleSubmit} loading={false} error={null} />;
}

export default App;
