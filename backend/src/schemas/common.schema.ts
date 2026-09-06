import { z } from 'zod';

/** Query string accepted by every list endpoint. */
export const listQuerySchema = z.object({
  monthBelongs: z.string().min(1).optional(),
  startDate:    z.string().min(1).optional(),
  endDate:      z.string().min(1).optional(),
  sortBy:       z.string().min(1).optional(),
  sortOrder:    z.enum(['asc', 'desc']).optional(),
  page:         z.coerce.number().int().positive().optional(),
  pageSize:     z.coerce.number().int().positive().max(500).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
