import { createRoom, roomExists } from '../socket.js';

const autoPrefix = '/api/v1/room';

function roomRoute(fastify, opts, next) {
  fastify.get('/create', (request, reply) => {
    const roomId = createRoom();
    reply.send({ roomId });
  });

  fastify.get('/:roomId', (request, reply) => {
    const { roomId } = request.params;
    reply.send({ exists: roomExists(roomId) });
  });

  next();
}

export { autoPrefix };
export default roomRoute;
