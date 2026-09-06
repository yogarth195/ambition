import { DateRange, kpiRepository } from '../repositories/kpi.repository';
import { KPI_TABLE_KEYS, KpiGranularity, KpiSeriesQuery, KpiTableKey } from '../schemas/kpi.schema';

type Period = 'today' | 'week' | 'month' | 'all';

export const VALID_PERIODS: Period[] = ['today', 'week', 'month', 'all'];

type Granularity = KpiGranularity;

/** Truncate to the start of the bucket this date falls in, in UTC. */
function startOfPeriod(date: Date, granularity: Granularity): Date {
  if (granularity === 'day')   return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (granularity === 'year')  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/** The bucket label a given date belongs to — this is the chart's period key. */
function periodKey(date: Date, granularity: Granularity): string {
  if (granularity === 'day')  return date.toISOString().slice(0, 10);
  if (granularity === 'year') return String(date.getUTCFullYear());
  return date.toISOString().slice(0, 7);
}

function endOfPeriod(date: Date, granularity: Granularity): Date {
  const start = startOfPeriod(date, granularity);
  if (granularity === 'day')  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  if (granularity === 'year') return new Date(Date.UTC(start.getUTCFullYear() + 1, 0, 1) - 1);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1) - 1);
}

/** No explicit range given — a sensible trailing window per granularity. */
function defaultSeriesRange(granularity: Granularity): DateRange {
  const now = new Date();
  const end = endOfPeriod(now, granularity);

  if (granularity === 'day')  return { start: startOfPeriod(new Date(now.getTime() - 29 * 86400000), 'day'), end };
  if (granularity === 'year') return { start: startOfPeriod(new Date(Date.UTC(now.getUTCFullYear() - 4, 0, 1)), 'year'), end };
  return { start: startOfPeriod(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)), 'month'), end };
}

/** Every period label between start and end, inclusive — so gaps in the data still show up as 0. */
function generatePeriods(range: DateRange, granularity: Granularity): string[] {
  const periods: string[] = [];
  let cursor = startOfPeriod(range.start, granularity);
  const end = range.end;

  while (cursor <= end) {
    periods.push(periodKey(cursor, granularity));
    if (granularity === 'day')       cursor = new Date(cursor.getTime() + 86400000);
    else if (granularity === 'year') cursor = new Date(Date.UTC(cursor.getUTCFullYear() + 1, 0, 1));
    else                              cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return periods;
}

export interface KpiParams {
  period?:    Period;
  startDate?: string; // YYYY-MM-DD
  endDate?:   string; // YYYY-MM-DD
}

function getRanges(period: Period): { current: DateRange; prev: DateRange } {
  const now = new Date();

  if (period === 'today') {
    const s = new Date(now); s.setHours(0, 0, 0, 0);
    const e = new Date(now); e.setHours(23, 59, 59, 999);
    const ps = new Date(s); ps.setDate(ps.getDate() - 1);
    const pe = new Date(e); pe.setDate(pe.getDate() - 1);
    return { current: { start: s, end: e }, prev: { start: ps, end: pe } };
  }

  if (period === 'week') {
    const e = new Date(now); e.setHours(23, 59, 59, 999);
    const s = new Date(now); s.setDate(s.getDate() - 6); s.setHours(0, 0, 0, 0);
    const pe = new Date(s); pe.setDate(pe.getDate() - 1); pe.setHours(23, 59, 59, 999);
    const ps = new Date(pe); ps.setDate(ps.getDate() - 6); ps.setHours(0, 0, 0, 0);
    return { current: { start: s, end: e }, prev: { start: ps, end: pe } };
  }

  if (period === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const ps = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const pe = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { current: { start: s, end: e }, prev: { start: ps, end: pe } };
  }

  // 'all'
  const s = new Date(0);
  const e = new Date(now); e.setHours(23, 59, 59, 999);
  return { current: { start: s, end: e }, prev: { start: new Date(0), end: new Date(0) } };
}

function resolveRanges(params: KpiParams): { current: DateRange; prev: DateRange } {
  if (params.startDate && params.endDate) {
    const start = new Date(params.startDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(params.endDate);   end.setHours(23, 59, 59, 999);

    // Previous period = same duration immediately before start
    const durationMs = end.getTime() - start.getTime();
    const prevEnd    = new Date(start.getTime() - 1);
    const prevStart  = new Date(prevEnd.getTime() - durationMs);

    return { current: { start, end }, prev: { start: prevStart, end: prevEnd } };
  }
  return getRanges(params.period ?? 'month');
}

function trend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Percentage to one decimal place, guarding against divide-by-zero. */
function ratio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export const kpiService = {
  async getSummary(params: KpiParams = {}) {
    const { current, prev } = resolveRanges(params);
    const agg = await kpiRepository.getSummaryAggregates(current, prev);

    const expenseTotal     = agg.labourTotal + agg.miscTotal;
    const prevExpenseTotal = agg.prevLabourTotal + agg.prevMiscTotal;
    const topArticle       = agg.productionByDesign[0] ?? null;

    return {
      dateRange: { start: current.start, end: current.end },
      production: {
        total:      agg.productionTotal,
        trend:      trend(agg.productionTotal, agg.prevProductionTotal),
        topArticle,
        byDesign:   agg.productionByDesign,
      },
      quality: {
        repairTotal:  agg.repairTotal,
        repairRate:   ratio(agg.repairTotal, agg.productionTotal),
        trimmerTotal: agg.trimmerTotal,
        buffingTotal: agg.buffingTotal,
      },
      packing: {
        total:            agg.packedTotal,
        packedVsProduced: ratio(agg.packedTotal, agg.productionTotal),
        byItem:           agg.packedByItem,
      },
      sales: {
        total:        agg.salesTotal,
        dispatchRate: ratio(agg.salesTotal, agg.packedTotal),
        byItem:       agg.salesByItem,
      },
      material: { evaTotal: agg.evaTotal },
      expenses: {
        labour:      agg.labourTotal,
        misc:        agg.miscTotal,
        total:       expenseTotal,
        costPerPair: agg.productionTotal > 0
          ? Math.round((expenseTotal / agg.productionTotal) * 100) / 100
          : 0,
        trend:       trend(expenseTotal, prevExpenseTotal),
      },
    };
  },

  /**
   * Chart-ready comparison series: one row per period, one numeric key per
   * requested table, always fully zero-filled — the shape never changes
   * regardless of which tables or granularity are asked for, so the frontend
   * can plot it without any per-table special-casing.
   */
  async getSeries(params: KpiSeriesQuery) {
    const granularity: Granularity = params.granularity ?? 'month';

    const tables: KpiTableKey[] = params.tables
      ? (params.tables.split(',').map(t => t.trim()).filter(Boolean) as KpiTableKey[])
      : [...KPI_TABLE_KEYS];

    const range: DateRange = params.startDate && params.endDate
      ? { start: startOfPeriod(new Date(params.startDate), granularity), end: endOfPeriod(new Date(params.endDate), granularity) }
      : defaultSeriesRange(granularity);

    const periods = generatePeriods(range, granularity);

    const sumsByTable = await Promise.all(
      tables.map(async table => {
        const rows = await kpiRepository.getTableSeries(table, range, granularity);
        const sums = new Map<string, number>();
        for (const row of rows) {
          // monthBelongs is the authoritative period; entryDate is only a fallback
          // for day granularity or tables without a monthBelongs column (Sale).
          const key = row.monthBelongs && granularity !== 'day'
            ? (granularity === 'year' ? row.monthBelongs.slice(0, 4) : row.monthBelongs)
            : periodKey(row.entryDate, granularity);
          sums.set(key, (sums.get(key) ?? 0) + row.value);
        }
        return sums;
      }),
    );

    const series = periods.map(period => {
      const row: { period: string } & Record<string, number | string> = { period };
      tables.forEach((table, i) => {
        row[table] = sumsByTable[i].get(period) ?? 0;
      });
      return row;
    });

    return { granularity, tables, series };
  },
};
