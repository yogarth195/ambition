export interface QueryParams {
  monthBelongs?: string;
  startDate?:    string;
  endDate?:      string;
  sortBy?:       string;
  sortOrder?:    'asc' | 'desc';
  page?:         number;
  pageSize?:     number;
}

export function buildQueryArgs(params: QueryParams): {
  where:   Record<string, any>;
  orderBy: Record<string, 'asc' | 'desc'>;
  skip:    number;
  take:    number;
} {
  const {
    monthBelongs,
    startDate,
    endDate,
    sortBy    = 'entryDate',
    sortOrder = 'desc',
    page      = 1,
    pageSize  = 50,
  } = params;

  const where: Record<string, any> = {};

  if (monthBelongs) {
    where.monthBelongs = monthBelongs;
  }

  if (startDate && endDate) {
    where.entryDate = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  return {
    where,
    orderBy: { [sortBy]: sortOrder },
    skip:    (page - 1) * pageSize,
    take:    pageSize,
  };
}
