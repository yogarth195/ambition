import { z } from 'zod';

export const createProductionSchema = z.object({
  design:       z.string().min(1),
  shorts:       z.coerce.number().int().min(1, 'Must be > 0'),
  shortUnit:    z.coerce.number().int().min(1),
  entryDate:    z.string().min(1),
  monthBelongs: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be a valid month (YYYY-MM)'),
  total:        z.coerce.number().int().min(0),
});

export type CreateProductionFormInput = z.infer<typeof createProductionSchema>;
