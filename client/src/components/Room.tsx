import CallPage from './CallPage';
import JoinScreen from './JoinScreen';
import { useState } from 'react';

function Room() {
  const [ready, setReady] = useState(false);

  return ready ? <CallPage /> : <JoinScreen setReady={setReady} />;
}

export default Room;
