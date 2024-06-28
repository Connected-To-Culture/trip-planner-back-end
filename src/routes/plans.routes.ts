import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import test from 'node:test';
import { Plan } from '~/models/plan.models';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyJwt } from '~/hooks/auth.hooks';
import z from 'zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.addHook('preHandler', verifyJwt() as any);

  app.get('/plans', async (req, res) => {
    const plans = await Plan.find({ userId: req.user.id });
    res.send(plans);
  });

  const planSchema = z
    .object({
      name: z.string().min(1),
      startDate: z.coerce
        .date()
        .refine((val) => new Date(val) >= new Date(), {
          message: 'startDate must be >= current date',
        })
        .optional(),
      endDate: z.coerce.date().optional(),
      travellerCount: z.number().int().min(1).optional(),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: 'endDate must be >= startDate',
    });

  app.post('/plans', { schema: { body: planSchema } }, async (req, res) => {
    const plan = await Plan.create({ ...req.body, userId: req.user.id });
    res.send(plan);
  });

  app.put('/plans/:id', { schema: { body: planSchema } }, async (req, res) => {
    const plan = await Plan.replaceOne(
      { _id: req.query.id, userId: req.user.id },
      { ...req.body, userId: req.user.id },
    );
    res.send(plan);
  });
};

export default plugin;
