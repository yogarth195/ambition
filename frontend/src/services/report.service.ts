import apiClient from '@/lib/axios';
import { ApiResponse, SoleReport, YearlySummary, YearlyReportData } from '@/types';

export interface MonthReportInput {
  year: number;
  month: number;
  monthName: string;
  totalProduction?: number | null;
  trimmer?: number | null;
  buffing?: number | null;
  repair?: number | null;
  packed?: string | null;
  balance?: number | null;
  purchaseQty?: number | null;
  purchaseAmt?: number | null;
}

export interface YearlySummaryInput {
  year: number;
  laborTotal?: number | null;
  expenseTotal?: number | null;
}

export const reportService = {
  getReportsByYear: async (year: number): Promise<YearlyReportData> => {
    const { data } = await apiClient.get<ApiResponse<YearlyReportData>>('/reports', { params: { year } });
    return data.data;
  },

  upsertMonthReport: async (input: MonthReportInput): Promise<SoleReport> => {
    const { data } = await apiClient.post<ApiResponse<SoleReport>>('/reports/month', input);
    return data.data;
  },

  deleteMonthReport: async (year: number, month: number): Promise<void> => {
    await apiClient.delete(`/reports/month/${year}/${month}`);
  },

  upsertYearlySummary: async (input: YearlySummaryInput): Promise<YearlySummary> => {
    const { data } = await apiClient.post<ApiResponse<YearlySummary>>('/reports/summary', input);
    return data.data;
  },

  getAvailableYears: async (): Promise<number[]> => {
    const { data } = await apiClient.get<ApiResponse<number[]>>('/reports/years');
    return data.data;
  },
};
