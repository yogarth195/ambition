export interface QueryParams {
  monthBelongs?: string;
  startDate?:    string;
  endDate?:      string;
  sortBy?:       string;
  sortOrder?:    'asc' | 'desc';
  page?:         number;
  pageSize?:     number;
}
