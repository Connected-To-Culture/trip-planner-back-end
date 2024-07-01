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
    startRedirectPath: '/oauth/google/redirect',
    callbackUriParams: {
      prompt: 'select_account',
    },
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
    startRedirectPath: '/oauth/facebook/redirect',
    callbackUri: `${process.env.BASE_URL}/oauth/facebook/callback`,
  });

  // redirect back to frontend after oauth callback
  const redirectUrl = `${process.env.FRONTEND_BASE_URL}/oauth/callback`;
  interface URLSearchParamsInput {
    [key: string]: string | string[];
  }
  const addParamsToRedirectUrl = (params: URLSearchParamsInput) =>
    `${redirectUrl}?${new URLSearchParams(params).toString()}`;

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
      return res.redirect(
        addParamsToRedirectUrl({
          statusCode: '403',
          message: 'Email is not verified. Please verify email',
        }),
      );
    }

    const user = await User.findOne({ email });
    // user with same email doesn't exist => create new user => log them in
    if (!user) {
      const newUser = await User.create({
        provider: Provider.Google,
        providerId,
        email,
        isVerified: true,
        name,
        picture,
      });

      return res.redirect(
        addParamsToRedirectUrl({
          statusCode: '201',
          jwt: createJwt({ id: newUser.id, type: JwtType.User }),
          userId: newUser.id,
        }),
      );
    }

    // user with same email exists with other provider
    if (user.provider !== Provider.Google) {
      return res.redirect(
        addParamsToRedirectUrl({
          statusCode: '409',
          message:
            'User with same email already exists with a different provider',
        }),
      );
    }

    // user with same email exists with google => log user in (respond with jwt)
    return res.redirect(
      addParamsToRedirectUrl({
        statusCode: '200',
        jwt: createJwt({ id: user.id, type: JwtType.User }),
        userId: user.id,
      }),
    );
  });

  app.get('/oauth/facebook/callback', async function (req, res) {
    const { token } =
      await app.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

    // get user data
    const { data } = await axios.get(
      'https://graph.facebook.com/me?fields=id,name,email,picture.type(large),verified',
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
      },
    );
    const { id: providerId, name, email } = data;
    const picture = data.picture?.data.url;

    const user = await User.findOne({ email });
    // user with same email doesn't exist => create new user => log them in
    if (!user) {
      const newUser = await User.create({
        provider: Provider.Facebook,
        providerId,
        email,
        isVerified: true,
        name,
        picture,
      });

      return res.redirect(
        addParamsToRedirectUrl({
          statusCode: '201',
          jwt: createJwt({ id: newUser.id, type: JwtType.User }),
          userId: newUser.id,
        }),
      );
    }

    // user with same email exists with other provider
    if (user.provider !== Provider.Facebook) {
      return res.redirect(
        addParamsToRedirectUrl({
          statusCode: '409',
          message:
            'User with same email already exists with a different provider',
        }),
      );
    }

    // user with same email exists with facebook => log user in (respond with jwt)
    return res.redirect(
      addParamsToRedirectUrl({
        statusCode: '200',
        jwt: createJwt({ id: user.id, type: JwtType.User }),
        userId: user.id,
      }),
    );
  });
};

export default plugin;
