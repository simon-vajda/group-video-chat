import { logger } from './app';
import Peer from './peer';

interface ChatItem {
  authorId: string;
  author: string;
  message: string;
  timeStamp: number;
}

class Room {
  id: string;
  peers: Map<string, Peer>;
  streams: Map<string, MediaStream>;
  messages: ChatItem[];
  onCallEnded: () => void;

  constructor() {
    this.id = this.generateId();
    this.peers = new Map();
    this.streams = new Map();
    this.messages = [];
  }

  addPeer(peer: Peer) {
    peer.index = this.peers.size;
    this.sendRoomStateTo(peer);
    this.peers.set(peer.id, peer);
    peer.connection.ontrack = (event) => this.onTrack(event, peer);
    peer.socket.on('disconnect', () => this.onDisconnect(peer));
    peer.socket.on('reaction', (reaction: string) =>
      this.onReaction(reaction, peer),
    );
    peer.socket.on('message', (message: string) =>
      this.onMessage(message, peer),
    );
    peer.socket.to(this.id).emit('peer-joined', peer.id, peer.name, peer.index);

    this.streams.forEach((stream, key) => {
      stream.getTracks().forEach((track) => {
        peer.connection.addTrack(track, stream);
      });
    });
  }

  onTrack(event: RTCTrackEvent, peer: Peer) {
    const stream = event.streams[0];
    const track = event.track;

    logger.trace(
      `Track ${track.kind}, streamId: ${stream.id} from peer: ${peer}`,
    );

    if (!this.streams.has(peer.id)) {
      peer.socket.to(this.id).emit('peer-stream', stream.id, peer.id);
    }

    this.streams.set(peer.id, stream);

    this.peers.forEach((p) => {
      if (p.id !== peer.id) {
        p.connection.addTrack(track, stream);
      }
    });
  }

  onDisconnect(peer: Peer) {
    logger.info(`Peer disconnected: ${peer}`);
    peer.socket.to(this.id).emit('peer-left', peer.id);
    peer.connection.close();
    this.peers.delete(peer.id);
    this.streams.delete(peer.id);

    if (this.peers.size === 0 && this.onCallEnded) {
      this.onCallEnded();
    }
  }

  sendRoomStateTo(peer: Peer) {
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

  onReaction(reaction: string, peer: Peer) {
    logger.trace(`Reaction in room ${this.id} from peer: ${peer}: ${reaction}`);

    if (reaction === 'hand-up') peer.handRaised = true;
    if (reaction === 'hand-down') peer.handRaised = false;

    peer.socket.to(this.id).emit('reaction', reaction, peer.id);
  }

  onMessage(message: string, peer: Peer) {
    logger.trace(`Message in room ${this.id} from peer: ${peer}`);
    const chatItem = {
      authorId: peer.id,
      author: peer.name,
      message,
      timeStamp: Date.now(),
    };
    peer.socket.to(this.id).emit('message', chatItem);
    this.messages.push(chatItem);
  }

  generateId() {
    const length = 6;
    let id = '';
    for (let i = 0; i < length; i++) {
      id += Math.floor(Math.random() * 10);
    }
    return id;
  }

  setOnCallEnded(onCallEnded: () => void) {
    this.onCallEnded = onCallEnded;
  }
}

export default Room;
