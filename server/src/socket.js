import { logger } from './app.js';
import Peer from './peer.js';
import Room from './room.js';

/** @type {Map<string, Room>} */
const rooms = new Map();

function handleConnection(socket) {
  socket.on('join', (name, roomId) => {
    if (!rooms.has(roomId)) {
      socket.emit('room-not-found', roomId);
      return;
    }

    socket.join(roomId);
    const peer = new Peer(socket, name);
    const room = rooms.get(roomId);
    room.addPeer(peer);
    logger.info(`Peer joined: ${peer} to room: ${room.id}`);
  });
}

function createRoom() {
  let room = new Room();
  while (rooms.has(room.id)) {
    room = new Room();
  }
  room.setOnCallEnded(() => {
    rooms.delete(room.id);
    logger.info(`Room deleted: ${room.id}`);
  });
  rooms.set(room.id, room);
  return room.id;
}

function roomExists(roomId) {
  return rooms.has(roomId);
}

export { handleConnection, createRoom, roomExists };
