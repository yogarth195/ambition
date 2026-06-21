import { z } from 'zod';

export const createMiscSchema = z.object({
  amount:       z.number().int().min(0),
  entryDate:    z.string().min(1),
  monthBelongs: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be a valid month (YYYY-MM)'),
});

export type CreateMiscFormInput = z.infer<typeof createMiscSchema>;
