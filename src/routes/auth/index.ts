import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import OAuth2, { OAuth2Namespace } from '@fastify/oauth2';
import * as process from 'process';

declare module 'fastify' {
    interface FastifyInstance {
        GoogleOAuth2: OAuth2Namespace;
        FacebookOAuth2: OAuth2Namespace;

        // apple needs purchase $99/year
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
};

const facebookOAuth2Options = {
    name: 'FacebookOAuth2',
    scope: ['email', 'public_profile'],
    credentials: {
        client: {
            id: process.env.FACEBOOK_CLIENT_ID,
            secret: process.env.FACEBOOK_CLIENT_SECRET,
        },
        auth: OAuth2.FACEBOOK_CONFIGURATION,
    },
    startRedirectPath: '/oauth2/facebook',
    callbackUri: 'http://localhost:8000/oauth2/facebook/callback',
};

export function registerGoogleOAuth2Provider(app: FastifyInstance) {
    app.register(OAuth2, googleOAuth2Options);
}

export function registerFacebookOAuth2Provider(app: FastifyInstance) {
    app.register(OAuth2, facebookOAuth2Options);
}

export default async (app: FastifyInstance) => {

    app.get('/oauth2/google/callback',async function (request: FastifyRequest, reply: FastifyReply) {
        const { token } = await app.GoogleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

        const fetch = await import('node-fetch');

        const userInfoResponse = await fetch.default('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            reply.code(500).send({ error: 'Failed to fetch user information from Google.' });
            return;
        }

        reply.redirect('http://localhost:4000/?access_token=' + token.access_token);
    });

    app.get('/oauth2/facebook/callback', async function (request: FastifyRequest, reply: FastifyReply) {
        const { token } = await app.FacebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

        const fetch = await import('node-fetch');

        const userInfoResponse = await fetch.default('https://graph.facebook.com/me?fields=id,name,email', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            reply.code(500).send({ error: 'Failed to fetch user information from Facebook.' });
            return;
        }

        reply.redirect('http://localhost:4000/?access_token=' + token.access_token);
    });

};
