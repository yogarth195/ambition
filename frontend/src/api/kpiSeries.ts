import { api } from './base';

export const KPI_SERIES_TABLES = [
  'production', 'trimmer', 'buffing', 'repair',
  'packed', 'quantity', 'labour', 'misc',
] as const;

export type KpiSeriesTable = typeof KPI_SERIES_TABLES[number];

export type KpiGranularity = 'day' | 'month' | 'year';

export interface KpiSeriesParams {
  tables: KpiSeriesTable[];
  granularity: KpiGranularity;
  startDate?: string;
  endDate?: string;
}

export type KpiSeriesRow = { period: string } & Record<KpiSeriesTable, number>;

export interface KpiSeriesResponse {
  granularity: KpiGranularity;
  tables: KpiSeriesTable[];
  series: KpiSeriesRow[];
}

export const kpiSeriesApi = {
  get: async (params: KpiSeriesParams): Promise<KpiSeriesResponse> => {
    const { data } = await api.get<{ data: KpiSeriesResponse }>('/kpi/series', {
      params: {
        tables:      params.tables.join(','),
        granularity: params.granularity,
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate   ? { endDate:   params.endDate }   : {}),
      },
    });
    return data.data;
  },
};
