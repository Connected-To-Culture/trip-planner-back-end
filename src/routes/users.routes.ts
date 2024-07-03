import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyJwt } from '~/hooks/auth.hooks';
import z from 'zod';
import { allNullable } from '~/schemas';
import { User } from '~/models/user.models';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.addHook('preHandler', verifyJwt() as any);

  app.get('/users/me', async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.send(user);
  });

  app.patch(
    '/users/me',
    {
      schema: {
        body: allNullable(
          z
            .object({
              picture: z.string().url(),
              name: z.string(),
              gender: z.enum(['Male', 'Female', 'Other']),
              dob: z.coerce.date().refine((val) => new Date(val) < new Date(), {
                message: 'dob must be < current date',
              }),
              zipcode: z.string().regex(/^\d{5}(-\d{4})?$/, {
                message:
                  'ZIP code must be 5 digits or 5+4 digits (e.g., 12345 or 12345-6789).',
              }),
            })
            .partial(),
        ),
      },
    },
    async (req, res) => {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { ...req.body },
        { returnDocument: 'after' },
      ).select('-password');

      res.send(user);
    },
  );
};

export default plugin;
