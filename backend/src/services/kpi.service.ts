import { DateRange, kpiRepository } from '../repositories/kpi.repository';

type Period = 'today' | 'week' | 'month' | 'all';

export const VALID_PERIODS: Period[] = ['today', 'week', 'month', 'all'];

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
};
