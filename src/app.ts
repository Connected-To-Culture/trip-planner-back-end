import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import formBody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import { fastifyAutoload } from '@fastify/autoload';
import path from 'path';
import 'dotenv/config';
import Cors from "@fastify/cors";
import { registerGoogleOAuth2Provider, registerFacebookOAuth2Provider } from './routes/auth';

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

registerGoogleOAuth2Provider(app);
registerFacebookOAuth2Provider(app);

app.register(helmet, {
    global: true,
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            'img-src': ['https:', 'data:'],
        },
    },
});

// const corsOptions = {
//     origin: '*',
// };

// Environment-specific CORS configuration
const corsOptions = process.env.NODE_ENV === 'production'
    ? { origin: ['https://example.com'] }  // Only allow specific origins in production
    : { origin: '*' };  // Allow all origins in development


app.register(Cors, corsOptions);

app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false,
});

// add route for chatbot
import apiRoutes from './routes/api';
app.register(apiRoutes, { prefix: '/api' });


app.setNotFoundHandler((req: FastifyRequest, reply: FastifyReply) => {
    reply.code(404).send({ error: 'Not Found' });
});

app.setErrorHandler((error, req, reply) => {
    req.log.error(error);  // Log the error
    reply.status(500).send({ error: 'Internal Server Error' });
});


const start = async () => {
    try {
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};





start();
