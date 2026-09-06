import { unprocessable } from './appError';

/**
 * The slice of a repository these guards need. Keeping it structural means the
 * service layer can pass any domain repository without importing Prisma.
 */
export interface MonthAwareRepository {
  hasAny(): Promise<boolean>;
  existsForMonth(month: string): Promise<boolean>;
}

export function prevMonth(monthBelongs: string): string {
  const [y, m] = monthBelongs.split('-').map(Number);
  const d = new Date(y, m - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function nextMonth(monthBelongs: string): string {
  const [y, m] = monthBelongs.split('-').map(Number);
  const d = new Date(y, m);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function requireMonthExists(
  repository: MonthAwareRepository,
  month: string,
  label: string,
): Promise<void> {
  // bootstrap: empty table, first entry is always free
  if (!(await repository.hasAny())) return;

  if (!(await repository.existsForMonth(month))) {
    throw unprocessable(
      `No ${label} entries found for ${month}. Add ${label} data for ${month} first.`,
    );
  }
}

export async function requireMonthAbsent(
  repository: MonthAwareRepository,
  month: string,
  label: string,
): Promise<void> {
  if (await repository.existsForMonth(month)) {
    throw unprocessable(
      `${label} entries already exist for ${month}. Delete those first before removing this entry.`,
    );
  }
}
