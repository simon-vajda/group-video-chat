import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifySchema,
} from 'fastify';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { authenticate } from './authRoute';

interface UpdateRequest extends FastifyRequest {
  Body: {
    name: string;
    newPassword: string;
    currentPassword: string;
  };
}

const autoPrefix = '/api/v1/account';
const userRepository = AppDataSource.getRepository(User);

const updateSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 30,
      },
      newPassword: {
        type: 'string',
        minLength: 8,
        maxLength: 30,
        pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$',
      },
      currentPassword: {
        type: 'string',
      },
    },
    required: ['currentPassword'],
  },
};

function accountRoute(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done,
) {
  fastify.put<UpdateRequest>(
    '/',
    { schema: updateSchema, onRequest: authenticate },
    async (request, reply) => {
      const { name, newPassword, currentPassword } = request.body;
      const { id } = request.user as User;
      const user = await userRepository.findOneBy({ id });

      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!validPassword) {
        reply.code(401).send({
          message: 'Incorrect password',
        });
        return;
      }

      if (!name && !newPassword) {
        reply.code(400).send({
          message: 'No changes detected',
        });
        return;
      }

      if (name) {
        user.name = name;
      }

      if (newPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
      }

      await userRepository.save(user);
      reply.code(204).send();
    },
  );

  done();
}

export { autoPrefix };
export default accountRoute;
