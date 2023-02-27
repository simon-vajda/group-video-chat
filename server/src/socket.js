import { logger } from './app.js';
import Peer from './peer.js';
import Room from './room.js';

const room = new Room();

export function handleConnection(socket) {
  socket.on('join', (name) => {
    const peer = new Peer(socket, name);
    room.addPeer(peer);
    logger.info(`Peer joined: ${peer.name} (${peer.id})`);
  });
}
