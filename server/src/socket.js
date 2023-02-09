import { logger } from './app.js';
import Peer from './peer.js';
import Room from './room.js';

const room = new Room();

export function handleConnection(socket) {
  const peer = new Peer(socket);
  logger.info(`Peer connected: ${this.id}`);
  room.addPeer(peer);
}
