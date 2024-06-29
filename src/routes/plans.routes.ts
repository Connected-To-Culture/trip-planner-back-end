import { Plan } from '~/models/plan.models';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyJwt } from '~/hooks/auth.hooks';
import z from 'zod';
import { mongoIdSchema } from '~/schemas';

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

  app.post(
    '/plans',
    {
      schema: { body: planSchema },
    },
    async (req, res) => {
      const plan = await Plan.create({ ...req.body, userId: req.user.id });
      res.send(plan);
    },
  );

  app.put(
    '/plans/:id',
    {
      schema: {
        body: planSchema,
        params: z.object({
          id: mongoIdSchema,
        }),
      },
    },
    async (req, res) => {
      const planId = req.params.id;
      const userId = req.user.id;

      const plan = await Plan.findByIdAndUpdate(
        { _id: planId, userId: userId },
        { ...req.body },
        { returnDocument: 'after' },
      );

      if (!plan) {
        return res.code(404).send({
          message: `plan with id ${planId} belonging to user with id ${userId} not found`,
        });
      }

      res.send(plan);
    },
  );

  app.delete(
    '/plans/:id',
    {
      schema: {
        params: z.object({
          id: mongoIdSchema,
        }),
      },
    },
    async (req, res) => {
      const planId = req.params.id;
      const userId = req.user.id;

      const plan = await Plan.findByIdAndDelete({
        _id: planId,
        userId: userId,
      });

      if (!plan) {
        return res.code(404).send({
          message: `plan with id ${planId} belonging to user with id ${userId} not found`,
        });
      }

      res.send();
    },
  );
};

export default plugin;
