import { z } from 'zod';

export const createTrimmerSchema = z.object({
  item:                z.string().min(1),
  value:               z.number().int().min(0),
  lastMonthRemaining:  z.number().int(),
  forRange:            z.string().optional(),
  monthBelongs:        z.string().min(1),
  entryDate:           z.coerce.date(),
});

export type CreateTrimmerInput = z.infer<typeof createTrimmerSchema>;
