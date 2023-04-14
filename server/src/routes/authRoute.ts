import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
  FastifySchema,
} from 'fastify';
import { createRoom, roomExists } from '../socket';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';

interface SignupRequest extends FastifyRequest {
  Body: {
    name: string;
    email: string;
    password: string;
  };
}

interface LoginRequest extends FastifyRequest {
  Body: {
    email: string;
    password: string;
  };
}

const autoPrefix = '/api/v1/auth';
const userRepository = AppDataSource.getRepository(User);

const signupSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 30,
      },
      email: { type: 'string', format: 'email' },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 30,
        pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$',
      },
    },
    required: ['name', 'email', 'password'],
  },
};

function authRoute(fastify: FastifyInstance, opts: FastifyPluginOptions, done) {
  fastify.post<SignupRequest>(
    '/signup',
    { schema: signupSchema },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const existingUser = await userRepository.findOneBy({ email });
      if (existingUser) {
        reply.code(409).send({
          message: 'User with the same email already exists',
        });
        return;
      }

      const user = new User();
      user.name = name;
      user.email = email;
      user.password = await bcrypt.hash(password, 10);
      await userRepository.save(user);
      reply.code(201).send();
    },
  );

  fastify.post<LoginRequest>('/login', async (request, reply) => {
    const { email, password } = request.body;

    const user = await userRepository.findOneBy({ email });
    if (!user) {
      reply.code(404).send({
        message: 'User not found',
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      reply.code(401).send({
        message: 'Incorrect password',
      });
      return;
    }

    const token = fastify.jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    reply.code(200).send({ token });
  });

  done();
}

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}

export { authenticate };
export default authRoute;
