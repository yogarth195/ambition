import { z } from 'zod';

export const createRepairSchema = z.object({
  item:         z.string().min(1),
  value:        z.number().int().min(0),
  monthBelongs: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be a valid month (YYYY-MM)'),
  entryDate:    z.string().min(1),
});

export type CreateRepairFormInput = z.infer<typeof createRepairSchema>;
