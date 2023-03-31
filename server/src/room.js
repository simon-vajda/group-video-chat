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
  }

  /**
   * @param {Peer} peer
   */
  addPeer(peer) {
    this.sendPeerListTo(peer);
    this.peers.set(peer.id, peer);
    peer.connection.ontrack = (event) => this.onTrack(event, peer);
    peer.socket.on('disconnect', () => this.onDisconnect(peer));
    peer.socket.to(this.id).emit('peer-joined', peer.id, peer.name);
    peer.reactionChannel.onmessage = (e) => this.onReaction(e.data, peer);
  }

  /**
   * @param {RTCTrackEvent} event
   * @param {Peer} peer
   */
  onTrack(event, peer) {
    logger.trace(
      `Track ${event.track.kind}, streamId: ${event.streams[0].id} from peer: ${peer.id}`,
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
    logger.info(`Peer disconnected: ${peer.id}`);
    peer.socket.to(this.id).emit('peer-left', peer.id);
    peer.connection.close();
    this.peers.delete(peer.id);
    this.streams.delete(peer.id);
  }

  /** @param {Peer} peer */
  sendPeerListTo(peer) {
    const peers = Array.from(this.peers).map(([pId, p]) => ({
      id: p.id,
      name: p.name,
      handRaised: p.handRaised,
    }));

    const streamOwners = Array.from(this.streams).map(([peerId, stream]) => ({
      streamId: stream.id,
      peerId,
    }));

    peer.socket.emit('peers', peers, streamOwners);
  }

  /**
   * @param {string} reaction
   * @param {Peer} peer
   */
  onReaction(reaction, peer) {
    logger.trace(`Reaction: ${reaction} from peer: ${peer.id}`);

    if (reaction === 'hand-up') peer.handRaised = true;
    if (reaction === 'hand-down') peer.handRaised = false;

    this.peers.forEach((p) => {
      if (p.id === peer.id) return;
      if (p.reactionChannel.readyState !== 'open') return;

      const data = {
        reaction,
        peerId: peer.id,
      };
      p.reactionChannel.send(JSON.stringify(data));
    });
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
