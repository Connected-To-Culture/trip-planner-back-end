
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import formBody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import { fastifyAutoload } from '@fastify/autoload';
import path from 'path';
import 'dotenv/config';
import Cors from "@fastify/cors";
import { registerGoogleOAuth2Provider, registerFacebookOAuth2Provider } from './routes/auth';
import setupRoutes from './routes/api';  // Import the setupRoutes function

const port = Number(process.env.PORT) || 4000;
const app = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
        },
    },
    ignoreTrailingSlash: true,
});

async function buildApp() {
    app.register(formBody);

    await registerGoogleOAuth2Provider(app);
    await registerFacebookOAuth2Provider(app);

    app.register(helmet, {
        global: true,
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                'img-src': ['https:', 'data:'],
            },
        },
    });

    const corsOptions = process.env.NODE_ENV === 'production'
        ? { origin: ['https://example.com'] }
        : { origin: '*' };

    app.register(Cors, corsOptions);


    // Register API routes
    await setupRoutes(app);  // Use the setupRoutes function here

    app.setNotFoundHandler((req: FastifyRequest, reply: FastifyReply) => {
        reply.code(404).send({ error: 'Not Found' });
    });

    app.setErrorHandler((error, req, reply) => {
        req.log.error(error);
        reply.status(500).send({ error: 'Internal Server Error' });
    });

    return app;
}

const start = async () => {
    try {
        const app = await buildApp();
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();



