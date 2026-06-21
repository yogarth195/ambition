import { z } from 'zod';

export const createMiscSchema = z.object({
  amount:       z.number().int().min(0),
  entryDate:    z.coerce.date(),
  monthBelongs: z.string().min(1),
});

export type CreateMiscInput = z.infer<typeof createMiscSchema>;
