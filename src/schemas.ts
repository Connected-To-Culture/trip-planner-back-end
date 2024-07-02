import z from 'zod';

export const mongoIdSchema = z.string().regex(/[0-9a-fA-F]{24}/, {
  message: 'id must be a 24 character hex string',
});

export const allNullable = <TSchema extends z.AnyZodObject>(
  schema: TSchema,
) => {
  const entries = Object.entries(schema.shape) as [
    keyof TSchema['shape'],
    z.ZodTypeAny,
  ][];

  const newProps = entries.reduce(
    (acc, [key, value]) => {
      acc[key] = value.nullable();
      return acc;
    },
    {} as {
      [key in keyof TSchema['shape']]: z.ZodNullable<TSchema['shape'][key]>;
    },
  );

  return z.object(newProps);
};
