import { User } from '~/models/user.models';
import jwt from 'jsonwebtoken';
import { sendEmail } from '~/utils/email.utils';
import z from 'zod';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyJwt } from '~/hooks/auth.hooks';
import { Jwt } from '~/types/auth.types';
import bcryptjs from 'bcryptjs';

// utils
const createJwt = (
  payload: string | object | Buffer,
  expiresIn: string = '1d',
) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
};
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

      // get user with given email => no user => error
      const user = await User.findOne({ email }).select('_id password');
      if (!user) {
        return res.status(401).send({ error: 'Incorrect login details' });
      }

      // password doesn't match => error
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send({ error: 'Incorrect login details' });
      }

      const userId = user._id;
      // respond with jwt
      return res.send({
        jwt: createJwt({ id: userId, type: Jwt.User }),
        userId,
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

      let user;
      try {
        // save new user to mongo
        user = await User.create({ email, password: await hash(password) });
      } catch (err) {
        // email has unique constraint => duplicate email => error will be thrown
        const DUPLICATE_KEY_ERROR = 11000;
        if (err.code === DUPLICATE_KEY_ERROR) {
          return res
            .status(409)
            .send({ message: 'user with same email already exists' });
        }
      }

      // send email with link containing jwt => click link => call separate endpoint to verify email using that jwt
      const jwt = createJwt({ id: user._id, type: Jwt.VerifyEmail });
      sendEmail(
        email,
        'Trip Planner - Email Verification',
        `<p>Click <a href="${process.env.DOMAIN}/auth/verify-email?jwt=${jwt}">here</a> to verify your email</p>`,
      );

      const userId = user._id;
      return res.status(201).send({
        jwt: createJwt({ id: userId, type: Jwt.User }),
        userId,
      });
    },
  );

  app.post(
    '/auth/verify-email',
    {
      preHandler: verifyJwt(Jwt.VerifyEmail),
    },
    async (req, res) => {
      await User.findByIdAndUpdate(req.user.id, { isVerified: true });
      const userId = req.user.id;
      return res.send({
        jwt: createJwt({ id: userId, type: Jwt.User }),
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
        const jwt = createJwt({ email, type: Jwt.ResetPassword });
        sendEmail(
          email,
          'Trip Planner - Reset Password',
          `<p>Click <a href="${process.env.DOMAIN}/auth/reset-password?jwt=${jwt}">here</a> to verify your email</p>`,
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
      preHandler: verifyJwt(Jwt.ResetPassword),
    },
    async (req, res) => {
      const { email } = req.user;
      const { password } = req.body;

      const { _id: userId } = await User.findOneAndUpdate(
        { email },
        { password: await hash(password) },
      ).select('_id');

      res.send({
        jwt: createJwt({ id: userId, type: Jwt.User }),
        userId,
      });
    },
  );
};

export default plugin;
