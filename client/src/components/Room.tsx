import { useSelector } from 'react-redux';
import { selectUser } from '../state/userSlice';
import CallPage from './CallPage';
import JoinScreen from './JoinScreen';

function Room() {
  const user = useSelector(selectUser);

  return user.name.length > 0 ? <CallPage /> : <JoinScreen />;
}

export default Room;
