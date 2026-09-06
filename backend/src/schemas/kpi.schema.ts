import { z } from 'zod';

/** Every domain table the comparison chart can plot. */
export const KPI_TABLE_KEYS = [
  'production', 'trimmer', 'buffing', 'repair',
  'packed', 'quantity', 'sale', 'labour', 'misc',
] as const;

export type KpiTableKey = typeof KPI_TABLE_KEYS[number];

export const KPI_GRANULARITIES = ['day', 'month', 'year'] as const;
export type KpiGranularity = typeof KPI_GRANULARITIES[number];

function validateDateRange(value: { startDate?: string; endDate?: string }, ctx: z.RefinementCtx) {
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
}

/**
 * `tables` is a comma-separated list (e.g. "production,trimmer"), validated
 * against KPI_TABLE_KEYS. Omitted means "all tables".
 */
export const kpiSeriesQuerySchema = z
  .object({
    tables:      z.string().optional(),
    granularity: z.enum(KPI_GRANULARITIES, {
      errorMap: () => ({ message: 'granularity must be day | month | year' }),
    }).optional(),
    startDate: z.string().optional(),
    endDate:   z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.tables) {
      const unknown = value.tables
        .split(',')
        .map(t => t.trim())
        .filter(t => t && !(KPI_TABLE_KEYS as readonly string[]).includes(t));

      if (unknown.length) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          path:    ['tables'],
          message: `Unknown table(s): ${unknown.join(', ')}. Valid: ${KPI_TABLE_KEYS.join(', ')}`,
        });
      }
    }

    validateDateRange(value, ctx);
  });

export type KpiSeriesQuery = z.infer<typeof kpiSeriesQuerySchema>;

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
