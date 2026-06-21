import { z } from 'zod';

export const createBuffingSchema = z.object({
  item:               z.string().min(1),
  value:              z.number().int().min(0),
  lastMonthRemaining: z.number().int(),
  forRange:           z.string().optional(),
  monthBelongs:       z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be a valid month (YYYY-MM)'),
  entryDate:          z.string().min(1),
}).superRefine((data, ctx) => {
  if (data.lastMonthRemaining === undefined || data.lastMonthRemaining === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['lastMonthRemaining'],
      message: "Last month's data must be loaded before submitting",
    });
  }
});

export type CreateBuffingFormInput = z.infer<typeof createBuffingSchema>;
