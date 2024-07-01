import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import formBody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import { fastifyAutoload } from '@fastify/autoload';
import path from 'path';
import 'dotenv/config';
import Cors from '@fastify/cors';
import { connectToMongoose } from '~/utils/db.utils';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { ZodError } from 'zod';

// init app
const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
  ignoreTrailingSlash: true,
});
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// utility plugins
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
app.register(Cors, {
  origin: '*',
});

// route plugins
app.register(fastifyAutoload, {
  dir: path.join(__dirname, 'routes'),
  dirNameRoutePrefix: false,
});

// error handlers
app.setNotFoundHandler((req: FastifyRequest, reply: FastifyReply) => {
  reply.code(404).send({ message: 'Not Found' });
});

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    // validation error from zod => nicely format it
    return reply.status(400).send({
      name: error.name,
      code: error.code,
      validationContext: error.validationContext,
      errors: error.errors,
    });
  }

  // server error => log it
  app.log.error(error);
  // respond with generic message if in prod
  const errorResponse =
    process.env.NODE_ENV === 'production'
      ? { message: 'Internal Server Error' }
      : error;
  return reply.status(500).send(errorResponse);
});

const start = async () => {
  try {
    connectToMongoose();
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
