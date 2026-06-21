import { z } from 'zod';

export const createRepairSchema = z.object({
  item:         z.string().min(1),
  value:        z.number().int().min(0),
  monthBelongs: z.string().min(1),
  entryDate:    z.coerce.date(),
});

export type CreateRepairInput = z.infer<typeof createRepairSchema>;
