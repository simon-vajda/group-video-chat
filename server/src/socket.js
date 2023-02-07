import Peer from './peer.js';
import Room from './room.js';

const room = new Room();

export function handleConnection(socket) {
  const peer = new Peer(socket);
  console.log('connected', peer.id);
  room.addPeer(peer);
}
