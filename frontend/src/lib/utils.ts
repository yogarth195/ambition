import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

export const FINANCIAL_YEAR_MONTHS = [
  { value: 5, label: 'May', name: 'may' },
  { value: 6, label: 'June', name: 'june' },
  { value: 7, label: 'July', name: 'july' },
  { value: 8, label: 'August', name: 'august' },
  { value: 9, label: 'September', name: 'september' },
  { value: 10, label: 'October', name: 'october' },
  { value: 11, label: 'November', name: 'november' },
  { value: 12, label: 'December', name: 'december' },
  { value: 1, label: 'January', name: 'january' },
  { value: 2, label: 'February', name: 'february' },
  { value: 3, label: 'March', name: 'march' },
  { value: 4, label: 'April', name: 'april' },
] as const;

export function getYearOptions(count = 6): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - i);
}

export function parseNullableFloat(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export function parseNullableInt(val: string): number | null {
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}
