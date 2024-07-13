import oauthPlugin from '@fastify/oauth2';
import * as process from 'process';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import axios from 'axios';
import { User } from '~/models/user.models';
import { JwtType, Provider } from '~/types/enums.types';
import { createJwt } from '~/utils/auth.utils';
import appleSignin from 'apple-signin-auth';
import path from 'path';
import fs from 'fs';

// redirect back to frontend after oauth callback
const loginUrl = `${process.env.FRONTEND_BASE_URL}/login`;
const homeUrl = `${process.env.FRONTEND_BASE_URL}/home`;
const addParamsToUrl = (url: string, params: any) =>
  `${url}?${new URLSearchParams(params).toString()}`;

// signup user if account doesn't already exist, else login
const handleUserSignupOrLogin = async (
  req,
  res,
  provider: Provider,
  providerId: string,
  email: string,
  name: string,
  picture: string,
) => {
  const user = await User.findOne({ email });
  // user with same email doesn't exist => create new user => log them in
  if (!user) {
    const newUser = await User.create({
      provider: provider,
      providerId,
      email,
      isVerified: true,
      name,
      picture,
    });

    return res.redirect(
      addParamsToUrl(homeUrl, {
        statusCode: '201',
        jwt: createJwt({ id: newUser.id, type: JwtType.User }),
        userId: newUser.id,
      }),
    );
  }

  // user with same email exists with other provider
  if (user.provider !== provider) {
    return res.redirect(
      addParamsToUrl(loginUrl, {
        statusCode: '409',
        message:
          'User with same email already exists with a different provider',
      }),
    );
  }

  // user with same email exists with given provider => log user in (respond with jwt)
  return res.redirect(
    addParamsToUrl(homeUrl, {
      statusCode: '200',
      jwt: createJwt({ id: user.id, type: JwtType.User }),
      userId: user.id,
    }),
  );
};

const plugin: FastifyPluginAsyncZod = async (app) => {
  // register google oauth
  app.register(oauthPlugin as any, {
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
    checkStateFunction: (req, callback) => {
      callback();
    },
    generateStateFunction: () => true,
  });

  app.get('/oauth/google/callback', async function (req, res) {
    // error being access_denied => user hit cancel => redirect to login
    const { error } = req.query as any;
    if (error === 'access_denied') {
      return res.redirect(loginUrl);
    }
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
        addParamsToUrl(loginUrl, {
          statusCode: '403',
          message: 'Email is not verified. Please verify email',
        }),
      );
    }

    // signup user if account doesn't already exist, else login
    await handleUserSignupOrLogin(
      req,
      res,
      Provider.Google,
      providerId,
      email,
      name,
      picture,
    );
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

    // signup user if account doesn't already exist, else login
    await handleUserSignupOrLogin(
      req,
      res,
      Provider.Facebook,
      providerId,
      email,
      name,
      picture,
    );
  });

  // register apple oauth
  const { APPLE_CLIENT_ID } = process.env;
  const CALLBACK_URI = `${process.env.BASE_URL_APPLE_OAUTH}/oauth/apple/callback`;

  app.get('/oauth/apple/redirect', async (req, res) => {
    return res.redirect(
      appleSignin.getAuthorizationUrl({
        clientID: APPLE_CLIENT_ID, // Apple Client ID
        redirectUri: CALLBACK_URI,
        responseMode: 'form_post', // Force set to form_post if scope includes 'email'
        scope: 'email', // optional
      }),
    );
  });

  app.post('/oauth/apple/callback', async function (req, res) {
    const { code, user } = req.body as any;
    let name = null;
    if (user) {
      const userData = JSON.parse(user);
      name = `${userData.name.firstName} ${userData.name.lastName}`;
    }

    const { id_token } = await appleSignin.getAuthorizationToken(code, {
      clientID: APPLE_CLIENT_ID,
      redirectUri: CALLBACK_URI,
      clientSecret: appleSignin.getClientSecret({
        clientID: APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY.replaceAll('\\n', '\n'),
        keyIdentifier: process.env.APPLE_KEY_ID,
        expAfter: 3600,
      }),
    });
    const {
      email,
      sub: providerId,
      email_verified,
    } = await appleSignin.verifyIdToken(id_token, APPLE_CLIENT_ID);

    if (!email_verified) {
      return res.redirect(
        addParamsToUrl(loginUrl, {
          statusCode: '403',
          message: 'Email is not verified. Please verify email',
        }),
      );
    }

    // signup user if account doesn't already exist, else login
    await handleUserSignupOrLogin(
      req,
      res,
      Provider.Apple,
      providerId,
      email,
      name,
      null,
    );
  });
};

export default plugin;
