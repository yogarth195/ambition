import { z } from 'zod';

export const createLabourSchema = z.object({
  amount:       z.number().int().min(0),
  entryDate:    z.coerce.date(),
  monthBelongs: z.string().min(1),
});

export type CreateLabourInput = z.infer<typeof createLabourSchema>;
