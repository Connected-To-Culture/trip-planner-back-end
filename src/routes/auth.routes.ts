import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import User from '~/models/user.models';
import jwt from 'jsonwebtoken';
import { sendEmail } from '~/utils/email.utils';
import z from 'zod';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createToken, hash } from '~/utils/auth.utils';
import { verifyToken } from '~/hooks/auth.hooks';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/auth/login',
    {
      schema: {
        body: z.object({
          email: z.string(),
          password: z.string(),
        }),
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      // Find user in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      // Verify password
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send({ error: 'Incorrect password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' },
      );

      // Respond with token
      return res.send({ message: 'Login successful', token });
    },
  );

  app.post(
    '/auth/sign-up',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string(),
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
      const token = createToken({ id: user._id, type: 'emailVerification' });
      sendEmail(
        email,
        'Trip Planner - Email Verification',
        `<p>Click <a href="${process.env.DOMAIN}/auth/verify-email?token=${token}">here</a> to verify your email</p>`,
      );

      return res.status(201).send({
        userToken: createToken({ id: user._id, type: 'user' }),
      });
    },
  );

  app.post(
    '/auth/verify-email',
    {
      preHandler: verifyToken('emailVerification'),
    },
    async (req, res) => {
      await User.findByIdAndUpdate(req.user.id, { isVerified: true });
      return res.send({
        userToken: createToken({ id: req.user.id, type: 'user' }),
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
        const token = createToken({ email, type: 'resetPassword' });
        sendEmail(
          email,
          'Trip Planner - Reset Password',
          `<p>Click <a href="${process.env.DOMAIN}/auth/reset-password?token=${token}">here</a> to verify your email</p>`,
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
          password: z.string(),
        }),
      },
      preHandler: verifyToken('resetPassword'),
    },
    async (req, res) => {
      const { email } = req.user;
      const { password } = req.body;

      await User.findOneAndUpdate(
        { email },
        { password: await hash(password) },
      );

      res.send({ userToken: createToken({ id: req.user.id, type: 'user' }) });
    },
  );
};

export default plugin;
