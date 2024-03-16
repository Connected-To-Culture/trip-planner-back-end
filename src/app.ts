import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import formBody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import { fastifyAutoload } from '@fastify/autoload';
import path from 'path';
import 'dotenv/config';

const port = Number(process.env.PORT) || 4000;
const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
  ignoreTrailingSlash: true,
});
app.register(formBody);

app.register(helmet, {
  global: true,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'img-src': ['https:', 'data:'],
    },
  },
});
app.register(fastifyAutoload, {
  dir: path.join(__dirname, 'routes'),
  dirNameRoutePrefix: false,
});
app.setNotFoundHandler((req: FastifyRequest, reply: FastifyReply) => {
  reply.code(404).send({ error: 'Not Found' });
});
const start = async () => {
  try {
    await app.listen({ port });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
