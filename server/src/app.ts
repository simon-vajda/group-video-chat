import Fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import autoload from '@fastify/autoload';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import pino from 'pino';
import { join } from 'path';
import { handleConnection } from './roomManager';
import { AppDataSource } from './dataSource';

const secret = process.env.JWT_SECRET || 'supersecretkey';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:HH:MM:ss',
    },
  },
  level: 'trace',
});

AppDataSource.initialize().catch(() => {
  logger.fatal(AppDataSource.options, 'Failed to connect to database');
  process.exit(1);
});

const fastify = Fastify({
  logger: logger,
});
fastify.register(fastifyIO, {
  cors: { origin: '*' },
  path: '/api/socket.io/',
});
fastify.register(cors, { origin: '*' });
fastify.register(fastifyJwt, { secret });
fastify.register(autoload, {
  dir: join(__dirname, 'routes'),
});

process.on('uncaughtException', (err) =>
  logger.error(err, 'node process uncaughtException'),
);
fastify.server.on('clientError', (err, socket) => {
  if (err.name === 'ECONNRESET' || !socket.writable) {
    socket.end('HTTP/2 400 Bad Request\n');
  }
});

fastify.ready().then(() => {
  fastify.io.on('connection', handleConnection);
});

fastify.listen({ port: 5000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    logger.fatal(err);
    process.exit(1);
  }
});
