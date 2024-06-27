import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import formBody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import { fastifyAutoload } from '@fastify/autoload';
import path from 'path';
import 'dotenv/config';
import Cors from '@fastify/cors';
import {
    registerGoogleOAuth2Provider,
    registerFacebookOAuth2Provider,
} from './routes/auth';

const app = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
        },
    },
    ignoreTrailingSlash: true,
});

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
registerGoogleOAuth2Provider(app);
registerFacebookOAuth2Provider(app);

app.setNotFoundHandler((req: FastifyRequest, reply: FastifyReply) => {
    reply.code(404).send({ error: 'Not Found' });
});

app.setErrorHandler((error, request, reply) => {
    // log server errors
    if (error.statusCode === 500) {
        app.log.error(error);
    }

    // server error => respond with generic server error in prod => otherwise just respond with the full error
    const errorResponse =
        error.statusCode === 500 && process.env.NODE_ENV! === 'production'
            ? { message: 'internal server error' }
            : error;
    return reply.status(error.statusCode).send(errorResponse);
});

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 4000;
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
