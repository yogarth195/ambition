import { z } from 'zod';

export const createSaleSchema = z.object({
  item:      z.string().min(1),
  value:     z.number().int().min(0),
  entryDate: z.coerce.date(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
