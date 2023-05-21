import CallPage from './CallPage';
import JoinPage from './JoinPage';
import { useState } from 'react';

function Room() {
  const [ready, setReady] = useState(false);

  return ready ? <CallPage /> : <JoinPage setReady={setReady} />;
}

export default Room;
