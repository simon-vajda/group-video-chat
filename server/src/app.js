import Fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import pino from 'pino';
import { handleConnection } from './socket.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fastifyStatic from '@fastify/static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const fastify = Fastify({
  logger: logger,
  // http2: true,
  // https: {
  //   key: readFileSync(join(__dirname, '../cert/server.key')),
  //   cert: readFileSync(join(__dirname, '../cert/server.cert')),
  //   requestCert: false,
  //   rejectUnauthorized: false,
  // },
});
fastify.register(fastifyIO, { cors: { origin: '*' } });
fastify.register(fastifyStatic, {
  root: join(__dirname, '../../client/build'),
  prefix: '/',
});

process.on('uncaughtException', (err) =>
  logger.warn(err, 'node process uncaughtException'),
);
fastify.server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    socket.end('HTTP/2 400 Bad Request\n');
  }
});

fastify.ready().then(() => {
  fastify.io.on('connection', handleConnection);
});

fastify.listen({ port: 5000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
});
