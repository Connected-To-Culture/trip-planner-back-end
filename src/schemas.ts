import z from 'zod';

export const mongoIdSchema = z
  .string()
  .regex(/[0-9a-fA-F]{24}/, {
    message: 'id must be a 24 character hex string',
  });
