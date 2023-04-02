import { logger } from './app.js';
import Peer from './peer.js';

class Room {
  constructor() {
    /** @type {string} */
    this.id = this.generateId();
    /** @type {Map<string, Peer>} */
    this.peers = new Map();
    /** @type {Map<string, MediaStream>} */
    this.streams = new Map();
    this.messages = [];
  }

  /**
   * @param {Peer} peer
   */
  addPeer(peer) {
    peer.index = this.peers.size;
    this.sendRoomStateTo(peer);
    this.peers.set(peer.id, peer);
    peer.connection.ontrack = (event) => this.onTrack(event, peer);
    peer.socket.on('disconnect', () => this.onDisconnect(peer));
    peer.socket.on('reaction', (reaction) => this.onReaction(reaction, peer));
    peer.socket.on('message', (message) => this.onMessage(message, peer));
    peer.socket.to(this.id).emit('peer-joined', peer.id, peer.name, peer.index);
  }

  /**
   * @param {RTCTrackEvent} event
   * @param {Peer} peer
   */
  onTrack(event, peer) {
    logger.trace(
      `Track ${event.track.kind}, streamId: ${event.streams[0].id} from peer: ${peer}`,
    );

    if (!this.streams.has(peer.id)) {
      peer.socket.to(this.id).emit('peer-stream', event.streams[0].id, peer.id);
    }

    this.streams.set(peer.id, event.streams[0]);

    this.peers.forEach((p) => {
      this.streams.forEach((stream, key) => {
        if (p.id === key) return;

        try {
          stream.getTracks().forEach((track) => {
            p.connection.addTrack(track, stream);
          });
        } catch (err) {}
      });
    });
  }

  /** @param {Peer} peer */
  onDisconnect(peer) {
    logger.info(`Peer disconnected: ${peer}`);
    peer.socket.to(this.id).emit('peer-left', peer.id);
    peer.connection.close();
    this.peers.delete(peer.id);
    this.streams.delete(peer.id);
  }

  /** @param {Peer} peer */
  sendRoomStateTo(peer) {
    const peers = Array.from(this.peers).map(([pId, p]) => ({
      id: p.id,
      name: p.name,
      index: p.index,
      handRaised: p.handRaised,
    }));

    const streamOwners = Array.from(this.streams).map(([peerId, stream]) => ({
      streamId: stream.id,
      peerId,
    }));

    peer.socket.emit('room-state', peers, streamOwners, this.messages);
  }

  /**
   * @param {string} reaction
   * @param {Peer} peer
   */
  onReaction(reaction, peer) {
    logger.trace(`Reaction in room ${this.id} from peer: ${peer}: ${reaction}`);

    if (reaction === 'hand-up') peer.handRaised = true;
    if (reaction === 'hand-down') peer.handRaised = false;

    peer.socket.to(this.id).emit('reaction', reaction, peer.id);
  }

  /**
   * @param {string} message
   * @param {Peer} peer
   */
  onMessage(message, peer) {
    logger.trace(`Message in room ${this.id} from peer: ${peer}`);
    const chatItem = {
      authorId: peer.id,
      message,
      timeStamp: Date.now(),
    };
    peer.socket.to(this.id).emit('message', chatItem);
    this.messages.push(chatItem);
  }

  /** @returns {string} */
  generateId() {
    const length = 6;
    let id = '';
    for (let i = 0; i < length; i++) {
      id += Math.floor(Math.random() * 10);
    }
    return id;
  }
}

export default Room;
