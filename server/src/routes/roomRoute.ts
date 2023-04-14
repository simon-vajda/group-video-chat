import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { createRoom, roomExists } from '../socket';
import { authenticate } from './authRoute';

interface RoomRequest extends FastifyRequest {
  Params: {
    roomId: string;
  };
}

const autoPrefix = '/api/v1/room';

function roomRoute(fastify: FastifyInstance, opts: FastifyPluginOptions, done) {
  fastify.get(
    '/create',
    {
      onRequest: authenticate,
    },
    (request, reply) => {
      const roomId = createRoom();
      reply.send({ roomId });
    },
  );

  fastify.get<RoomRequest>('/:roomId', (request, reply) => {
    const { roomId } = request.params;
    reply.send({ exists: roomExists(roomId) });
  });

  done();
}

export { autoPrefix };
export default roomRoute;
