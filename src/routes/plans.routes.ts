import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import test from 'node:test';
import { Plan } from '~/models/plan.models';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyJwt } from '~/hooks/auth.hooks';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/plans',
    {
      preHandler: verifyJwt(),
    },
    async (req, res) => {
      const plans = await Plan.find({ userId: req.user.id });
      res.send(plans);
    },
  );
};

export default plugin;
