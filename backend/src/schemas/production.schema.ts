import { z } from 'zod';

export const createProductionSchema = z.object({
  design:       z.string().min(1),
  shorts:       z.number().int().min(0),
  shortUnit:    z.number().int().min(0),
  entryDate:    z.coerce.date(),
  monthBelongs: z.string().min(1),
  total:        z.number().int().min(0),
});

export type CreateProductionInput = z.infer<typeof createProductionSchema>;
