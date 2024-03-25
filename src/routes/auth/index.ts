import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import OAuth2, { OAuth2Namespace } from '@fastify/oauth2';
import * as process from 'process';

declare module 'fastify' {
    interface FastifyInstance {
        GoogleOAuth2: OAuth2Namespace;
    }
}

const googleOAuth2Options = {
    name: 'GoogleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET,
        },
        auth: OAuth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/oauth2/google',
    callbackUri: 'http://localhost:8000/oauth2/google/callback',

    // have some problems here...
    generateStateFunction: (request: FastifyRequest) => {
        return request.query.state;
    },
    checkStateFunction: (request: FastifyRequest, callback: any) => {
        if (request.query.state) {
            callback();
            return;
        }
    },
};

export function registerGoogleOAuth2Provider(app: FastifyInstance) {
    app.register(OAuth2, googleOAuth2Options);
}

export default async (app: FastifyInstance) => {

    app.get('/oauth2/google/callback',async function (request: FastifyRequest, reply: FastifyReply) {

        const { token } = await app.GoogleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            reply.code(500).send({ error: 'Failed to fetch user information from Google.' });
            return;
        }

        // only save this email to database for first time user
        // const userInfo = await userInfoResponse.json();
        // console.log('User Info:', userInfo);

        reply.redirect('http://localhost:4000/?access_token=' + token.access_token);
    });
};
