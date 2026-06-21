import prisma from '../prisma/client';

type Period = 'today' | 'week' | 'month' | 'all';

export interface KpiParams {
  period?: Period;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

interface DateRange { start: Date; end: Date }

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
    const prevEnd   = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    return { current: { start, end }, prev: { start: prevStart, end: prevEnd } };
  }
  return getRanges(params.period ?? 'month');
}

function trend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function where(range: DateRange) {
  return { date: { gte: range.start, lte: range.end } };
}

export class KpiService {
  async getSummary(params: KpiParams = {}) {
    const { current, prev } = resolveRanges(params);

    const [
      prodAgg, prevProdAgg,
      prodByDesign,
      trimmerAgg, buffingAgg, repairAgg,
      packedAgg, packedByItem,
      saleAgg, saleByItem,
      quantityAgg,
      labourAgg, prevLabourAgg,
      miscAgg, prevMiscAgg,
    ] = await Promise.all([
      prisma.production.aggregate({ where: where(current), _sum: { total: true } }),
      prisma.production.aggregate({ where: where(prev),    _sum: { total: true } }),

      prisma.production.groupBy({
        by: ['design'],
        where: where(current),
        _sum: { total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),

      prisma.trimmer.aggregate({ where: where(current), _sum: { value: true } }),
      prisma.buffing.aggregate({ where: where(current), _sum: { value: true } }),
      prisma.repair.aggregate({ where: where(current), _sum: { value: true } }),

      prisma.packed.aggregate({ where: where(current), _sum: { value: true } }),
      prisma.packed.groupBy({
        by: ['item'],
        where: where(current),
        _sum: { value: true },
        orderBy: { _sum: { value: 'desc' } },
      }),

      prisma.sale.aggregate({ where: where(current), _sum: { value: true } }),
      prisma.sale.groupBy({
        by: ['item'],
        where: where(current),
        _sum: { value: true },
        orderBy: { _sum: { value: 'desc' } },
      }),

      prisma.quantity.aggregate({ where: where(current), _sum: { value: true } }),

      prisma.labour.aggregate({ where: where(current), _sum: { value: true } }),
      prisma.labour.aggregate({ where: where(prev),    _sum: { value: true } }),
      prisma.misc.aggregate({ where: where(current), _sum: { value: true } }),
      prisma.misc.aggregate({ where: where(prev),    _sum: { value: true } }),
    ]);

    const productionTotal     = prodAgg._sum.total       ?? 0;
    const prevProductionTotal = prevProdAgg._sum.total   ?? 0;
    const repairTotal         = repairAgg._sum.value     ?? 0;
    const trimmerTotal        = trimmerAgg._sum.value    ?? 0;
    const buffingTotal        = buffingAgg._sum.value    ?? 0;
    const packedTotal         = packedAgg._sum.value     ?? 0;
    const salesTotal          = saleAgg._sum.value       ?? 0;
    const evaTotal            = quantityAgg._sum.value   ?? 0;
    const labourTotal         = labourAgg._sum.value     ?? 0;
    const prevLabourTotal     = prevLabourAgg._sum.value ?? 0;
    const miscTotal           = miscAgg._sum.value       ?? 0;
    const prevMiscTotal       = prevMiscAgg._sum.value   ?? 0;
    const expenseTotal        = labourTotal + miscTotal;
    const prevExpenseTotal    = prevLabourTotal + prevMiscTotal;

    return {
      dateRange: { start: current.start, end: current.end },
      production: {
        total:      productionTotal,
        trend:      trend(productionTotal, prevProductionTotal),
        topArticle: prodByDesign[0]
          ? { design: prodByDesign[0].design, total: prodByDesign[0]._sum.total ?? 0 }
          : null,
        byDesign: prodByDesign.map(r => ({ design: r.design, total: r._sum.total ?? 0 })),
      },
      quality: {
        repairTotal,
        repairRate:   productionTotal > 0 ? Math.round((repairTotal / productionTotal) * 1000) / 10 : 0,
        trimmerTotal,
        buffingTotal,
      },
      packing: {
        total: packedTotal,
        packedVsProduced: productionTotal > 0 ? Math.round((packedTotal / productionTotal) * 1000) / 10 : 0,
        byItem: packedByItem.map(r => ({ item: r.item, value: r._sum.value ?? 0 })),
      },
      sales: {
        total: salesTotal,
        dispatchRate: packedTotal > 0 ? Math.round((salesTotal / packedTotal) * 1000) / 10 : 0,
        byItem: saleByItem.map(r => ({ item: r.item, value: r._sum.value ?? 0 })),
      },
      material: { evaTotal },
      expenses: {
        labour:      labourTotal,
        misc:        miscTotal,
        total:       expenseTotal,
        costPerPair: productionTotal > 0 ? Math.round((expenseTotal / productionTotal) * 100) / 100 : 0,
        trend:       trend(expenseTotal, prevExpenseTotal),
      },
    };
  }
}

export const kpiService = new KpiService();
