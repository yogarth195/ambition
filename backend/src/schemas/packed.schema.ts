import { z } from 'zod';

export const createPackedSchema = z.object({
  item:         z.string().min(1),
  value:        z.number().int().min(0),
  entryDate:    z.coerce.date(),
  monthBelongs: z.string().min(1),
});

export type CreatePackedInput = z.infer<typeof createPackedSchema>;
