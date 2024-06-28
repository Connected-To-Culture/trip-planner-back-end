import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import test from 'node:test';
import { Plan } from '~/models/plan.models';

export default async (app: FastifyInstance) => {
  app.get('/user/plans', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const plans = await Plan.find(
        {},
        {
          _id: true,
          tripName: true,
          tripStartDate: true,
          tripEndDate: true,
          numOfTravelers: true,
          totalExpense: true,
        },
      );

      if (!plans) {
        return reply.status(404).send({ message: 'Plans not found' });
      }
      return reply.send(plans);
    } catch (error) {
      console.error('Error querying user:', error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });
};
