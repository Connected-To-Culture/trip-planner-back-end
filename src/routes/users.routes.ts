import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { User } from '~/models/user.models';

export default async (app: FastifyInstance) => {
  app.get<{
    Querystring: {
      id?: string;
      email?: string;
    };
  }>(
    '/users',
    async (
      req: FastifyRequest<{
        Querystring: { id?: string; email?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { id, email } = req.query;
      try {
        let query = {};
        if (id) {
          query = { id: id };
        } else if (email) {
          query = { email: email };
        } else {
          return reply.status(400).send({
            message: 'Query parameter id or email is required',
          });
        }

        const user = await User.findOne(query);
        if (!user) {
          return reply.status(404).send({ message: 'User not found' });
        }
        return reply.send(user);
      } catch (error) {
        console.error('Error querying user:', error);
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );
};
