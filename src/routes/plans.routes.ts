import { Plan } from '~/models/plan.models';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyJwt } from '~/hooks/auth.hooks';
import z from 'zod';
import { mongoIdSchema, allNullable } from '~/schemas';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.addHook('preHandler', verifyJwt() as any);

  app.get('/users/me/plans', async (req, res) => {
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
        .nullable(),
      endDate: z.coerce.date().nullable(),
      travellerCount: z.number().int().min(1).nullable(),
    })
    .refine(
      (data) =>
        data.startDate && data.endDate ? data.endDate >= data.startDate : true,
      {
        message: 'endDate must be >= startDate',
      },
    );

  app.post(
    '/users/me/plans',
    {
      schema: {
        body: planSchema,
      },
    },
    async (req, res) => {
      const plan = await Plan.create({
        ...req.body,
        userId: req.user.id,
      });
      res.send(plan);
    },
  );

  app.patch(
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
        { _id: planId, userId },
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
