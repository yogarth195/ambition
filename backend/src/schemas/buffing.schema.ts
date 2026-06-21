import { z } from 'zod';

export const createBuffingSchema = z.object({
  item:                z.string().min(1),
  value:               z.number().int().min(0),
  lastMonthRemaining:  z.number().int(),
  forRange:            z.string().optional(),
  monthBelongs:        z.string().min(1),
  entryDate:           z.coerce.date(),
});

export type CreateBuffingInput = z.infer<typeof createBuffingSchema>;
