import { logger } from './app.js';
import Peer from './peer.js';

class Room {
  constructor() {
    /** @type {Map<string, Peer>} */
    this.peers = new Map();
    /** @type {Map<string, MediaStream>} */
    this.streams = new Map();
  }

  /**
   * @param {Peer} peer
   */
  addPeer(peer) {
    this.peers.set(peer.id, peer);
    peer.connection.ontrack = (event) => this.onTrack(event, peer);
    peer.socket.on('disconnect', () => this.onDisconnect(peer));
  }

  onTrack(event, peer) {
    logger.info(
      `Track id: ${event.track.id}, streamId: ${event.streams[0].id} from peer: ${peer.id}`,
    );

    const found = this.streams.get(peer.id);
    this.streams.set(peer.id, event.streams[0]);

    if (found) {
      this.peers.forEach((p) => {
        this.streams.forEach((stream, key) => {
          if (p.id === key) return;
          if (p.connectedTo.has(key)) return;

          try {
            stream.getTracks().forEach((track) => {
              p.connection.addTrack(track, stream);
            });
            p.connectedTo.add(key);
          } catch (err) {
            logger.error(err);
          }
        });
      });
    }
  }

  onDisconnect(peer) {
    logger.info(`Peer disconnected: ${peer.id}`);
    peer.socket.broadcast.emit('peer-disconnected', peer.id);
    peer.connection.close();
    this.peers.delete(peer.id);
    this.streams.delete(peer.id);
  }
}

export default Room;
