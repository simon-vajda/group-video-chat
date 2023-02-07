import Fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import pino from 'pino';
import { handleConnection } from './socket.js';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
    },
  },
});

const fastify = Fastify({ logger: logger });
fastify.register(fastifyIO, { cors: { origin: '*' } });

fastify.ready().then(() => {
  fastify.io.on('connection', handleConnection);
});

fastify.listen({ port: 5000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
