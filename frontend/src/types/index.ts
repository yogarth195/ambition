export type Role = 'ADMIN' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SoleReport {
  id: string;
  year: number;
  month: number;
  monthName: string;
  totalProduction: number | null;
  trimmer: number | null;
  buffing: number | null;
  repair: number | null;
  packed: string | null;
  balance: number | null;
  purchaseQty: number | null;
  purchaseAmt: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface YearlySummary {
  id: string;
  year: number;
  laborTotal: number | null;
  expenseTotal: number | null;
  grandTotal: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface YearlyReportData {
  reports: SoleReport[];
  summary: YearlySummary | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
