import oauthPlugin from '@fastify/oauth2';
import * as process from 'process';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import axios from 'axios';
import { User } from '~/models/user.models';
import { hash } from 'bcryptjs';
import { DUPLICATE_KEY_ERROR } from '~/constants';
import { JwtType, Provider } from '~/types/enums.types';
import { createJwt } from '~/utils/auth.utils';

const plugin: FastifyPluginAsyncZod = async (app) => {
  // register google oauth
  app.register(oauthPlugin, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/oauth/google',
    callbackUri: `${process.env.BASE_URL}/oauth/google/callback`,
  });

  // register facebook oauth
  app.register(oauthPlugin, {
    name: 'facebookOAuth2',
    scope: ['public_profile', 'email'],
    credentials: {
      client: {
        id: process.env.FACEBOOK_CLIENT_ID,
        secret: process.env.FACEBOOK_CLIENT_SECRET,
      },
      auth: oauthPlugin.FACEBOOK_CONFIGURATION,
    },
    startRedirectPath: '/oauth/facebook',
    callbackUri: `${process.env.BASE_URL}/oauth/google/callback`,
  });

  app.get('/oauth/google/callback', async function (req, res) {
    const { token } =
      await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

    // get account details
    const {
      data: { id: providerId, email, verified_email, name, picture },
    } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    // email must be verified
    if (!verified_email) {
      return res
        .code(403)
        .send({ message: 'Email is not verified. Please verify email' });
    }

    const user = await User.findOne({ email });
    // user with same email doesn't exist => create new user
    if (!user) {
      const newUser = await User.create({
        provider: Provider.Google,
        providerId,
        email,
        isVerified: true,
        name,
        profileImage: picture,
      });

      return res.code(201).send({
        jwt: createJwt({ id: newUser.id, type: JwtType.User }),
        userId: newUser.id,
      });
    }

    // user with same email exists with other provider
    if (user.provider !== Provider.Google) {
      return res.send(409).send({
        message:
          'User with same email already exists with a different provider',
      });
    }

    // user with same email exists with google => log user in (respond with jwt)
    return res.send({
      jwt: createJwt({ id: user.id, type: JwtType.User }),
      userId: user.id,
    });
  });

  app.get('/oauth/facebook/callback', async function (req, res) {
    const { token } =
      await app.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

    res.send(token);
  });
};

export default plugin;
