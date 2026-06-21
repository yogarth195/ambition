import { z } from 'zod';

export const createQuantitySchema = z.object({
  item:         z.string().min(1),
  value:        z.number().int().min(0),
  entryDate:    z.coerce.date(),
  monthBelongs: z.string().min(1),
});

export type CreateQuantityInput = z.infer<typeof createQuantitySchema>;
