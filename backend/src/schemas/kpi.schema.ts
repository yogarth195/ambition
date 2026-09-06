import { z } from 'zod';

/**
 * A custom range takes priority over `period`, but it is only honoured when
 * both ends are supplied — hence the cross-field checks rather than plain
 * per-field validation.
 */
export const kpiQuerySchema = z
  .object({
    period:    z.enum(['today', 'week', 'month', 'all'], {
      errorMap: () => ({ message: 'period must be today | week | month | all' }),
    }).optional(),
    startDate: z.string().optional(),
    endDate:   z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const { startDate, endDate } = value;
    if (!startDate && !endDate) return;

    if (!startDate || !endDate) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    [startDate ? 'endDate' : 'startDate'],
        message: 'Both startDate and endDate are required for custom range',
      });
      return;
    }

    for (const field of ['startDate', 'endDate'] as const) {
      if (isNaN(Date.parse(value[field]!))) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    [field],
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
        return;
      }
    }

    if (new Date(startDate) > new Date(endDate)) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['startDate'],
        message: 'startDate must be before endDate',
      });
    }
  });

export type KpiQuery = z.infer<typeof kpiQuerySchema>;
