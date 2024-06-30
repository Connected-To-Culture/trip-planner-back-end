import { User } from '~/models/user.models';
import jwt from 'jsonwebtoken';
import { sendEmail } from '~/utils/email.utils';
import z from 'zod';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyJwt } from '~/hooks/auth.hooks';
import { JwtType, Provider } from '~/types/enums.types';
import bcryptjs from 'bcryptjs';
import { DUPLICATE_KEY_ERROR } from '~/constants';
import { createJwt } from '~/utils/auth.utils';

// util
const hash = (s: string) => {
  return bcryptjs.hash(s, 10);
};

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/auth/login',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }),
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      // get user with given email
      const user = await User.findOne({
        email,
      }).select('_id password');
      // user with same email doesn't exist
      if (!user) {
        return res.status(401).send({ message: 'Incorrect email' });
      }

      // user with same email exists with different provider
      if (user.provider !== Provider.Standard) {
        return res.status(401).send({
          message:
            'User with same email already exists with a different provider',
        });
      }

      // user with same email exists with standard login
      // password doesn't match
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send({ message: 'Incorrect password' });
      }

      // respond with jwt
      return res.send({
        jwt: createJwt({ id: user._id, type: JwtType.User }),
        userId: user._id,
      });
    },
  );

  app.post(
    '/auth/sign-up',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }),
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      // user with same email doesn't exist => create new user
      if (!user) {
        const newUser = await User.create({
          email,
          password: await hash(password),
        });

        // send email with link containing jwt => click link => call POST /auth/verify-email in react to verify email using that jwt
        const jwt = createJwt({ id: newUser.id, type: JwtType.VerifyEmail });
        sendEmail(
          email,
          'Trip Planner - Email Verification',
          `<p>Click <a href="${process.env.FRONTEND_BASE_URL}/auth/verify-email?jwt=${jwt}">here</a> to verify your email</p>`,
        );

        return res.status(201).send({
          jwt: createJwt({ id: newUser.id, type: JwtType.User }),
          userId: newUser.id,
        });
      }

      // user with same email exists (if it's with different provider let them know)
      const message =
        user.provider !== Provider.Standard
          ? 'User with same email already exists with a different provider'
          : 'User with same email already exists';
      return res.status(409).send({ message });
    },
  );

  app.post(
    '/auth/verify-email',
    {
      preHandler: verifyJwt(JwtType.VerifyEmail),
    },
    async (req, res) => {
      await User.findByIdAndUpdate(req.user.id, { isVerified: true });
      const userId = req.user.id;
      return res.send({
        jwt: createJwt({ id: userId, type: JwtType.User }),
        userId,
      });
    },
  );

  app.post(
    '/auth/request-reset-password',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (req, res) => {
      const { email } = req.body;
      const isUserRegistered = await User.exists({ email });
      if (isUserRegistered) {
        // send email with link containing jwt => click link => call separate endpoint to verify email using that jwt
        const jwt = createJwt({ email, type: JwtType.ResetPassword });
        sendEmail(
          email,
          'Trip Planner - Reset Password',
          `<p>Click <a href="${process.env.FRONTEND_BASE_URL}/auth/reset-password?jwt=${jwt}">here</a> to verify your email</p>`,
        );
      }

      res.send({
        message: "If you're registered, you will receive a password reset link",
      });
    },
  );

  app.post(
    '/auth/reset-password',
    {
      schema: {
        body: z.object({
          password: z.string().min(1),
        }),
      },
      preHandler: verifyJwt(JwtType.ResetPassword),
    },
    async (req, res) => {
      const { email } = req.user;
      const { password } = req.body;

      const { _id: userId } = await User.findOneAndUpdate(
        { email },
        { password: await hash(password) },
      ).select('_id');

      res.send({
        jwt: createJwt({ id: userId, type: JwtType.User }),
        userId,
      });
    },
  );
};

export default plugin;
