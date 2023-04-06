import { Socket } from 'socket.io';
import { logger } from './app';
import Peer from './peer';
import Room from './room';

const rooms: Map<string, Room> = new Map();

function handleConnection(socket: Socket) {
  socket.on('join', (name: string, roomId: string) => {
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

function roomExists(roomId: string) {
  return rooms.has(roomId);
}

export { handleConnection, createRoom, roomExists };
