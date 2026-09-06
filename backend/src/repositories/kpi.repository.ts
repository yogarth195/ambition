import prisma from '../prisma/client';
import { KpiGranularity, KpiTableKey } from '../schemas/kpi.schema';

export interface DateRange {
  start: Date;
  end:   Date;
}

function where(range: DateRange) {
  return { entryDate: { gte: range.start, lte: range.end } };
}

interface SeriesRow {
  entryDate:    Date;
  monthBelongs: string | null;
  value:        number;
}

/**
 * month/year grouping must key off `monthBelongs` (the app's authoritative
 * reporting period), not `entryDate` (just "when someone typed it in") — a
 * row entered on 2026-06-12 for monthBelongs "2026-01" belongs under January,
 * not June. Filtering by the same field it's grouped by keeps both sides
 * consistent. Only `day` granularity, and tables with no monthBelongs column
 * (Sale), fall back to entryDate.
 */
function whereFor(range: DateRange, granularity: KpiGranularity, hasMonthBelongs: boolean) {
  if (granularity === 'day' || !hasMonthBelongs) return where(range);
  return {
    monthBelongs: {
      gte: range.start.toISOString().slice(0, 7),
      lte: range.end.toISOString().slice(0, 7),
    },
  };
}

/**
 * One query per table, normalized to the same { entryDate, monthBelongs,
 * value } shape regardless of what the underlying column is called
 * (total/value/amount). This is what lets the series endpoint below treat
 * every table identically.
 */
const SERIES_QUERIES: Record<KpiTableKey, (range: DateRange, granularity: KpiGranularity) => Promise<SeriesRow[]>> = {
  production: async (range, granularity) =>
    (await prisma.production.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, total: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.total })),

  trimmer: async (range, granularity) =>
    (await prisma.trimmer.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, value: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.value })),

  buffing: async (range, granularity) =>
    (await prisma.buffing.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, value: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.value })),

  repair: async (range, granularity) =>
    (await prisma.repair.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, value: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.value })),

  packed: async (range, granularity) =>
    (await prisma.packed.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, value: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.value })),

  quantity: async (range, granularity) =>
    (await prisma.quantity.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, value: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.value })),

  labour: async (range, granularity) =>
    (await prisma.labour.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, amount: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.amount })),

  misc: async (range, granularity) =>
    (await prisma.misc.findMany({
      where:  whereFor(range, granularity, true),
      select: { entryDate: true, monthBelongs: true, amount: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: r.monthBelongs, value: r.amount })),

  // Sale has no monthBelongs column — always entryDate-based, regardless of granularity.
  sale: async (range) =>
    (await prisma.sale.findMany({
      where:  where(range),
      select: { entryDate: true, value: true },
    })).map(r => ({ entryDate: r.entryDate, monthBelongs: null, value: r.value })),
};

/**
 * Every aggregate the KPI summary needs, fetched in one round trip. The service
 * owns the arithmetic; this layer only owns the queries.
 */
export const kpiRepository = {
  getTableSeries(table: KpiTableKey, range: DateRange, granularity: KpiGranularity): Promise<SeriesRow[]> {
    return SERIES_QUERIES[table](range, granularity);
  },

  async getSummaryAggregates(current: DateRange, prev: DateRange) {
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

      prisma.labour.aggregate({ where: where(current), _sum: { amount: true } }),
      prisma.labour.aggregate({ where: where(prev),    _sum: { amount: true } }),
      prisma.misc.aggregate({ where: where(current), _sum: { amount: true } }),
      prisma.misc.aggregate({ where: where(prev),    _sum: { amount: true } }),
    ]);

    return {
      productionTotal:     prodAgg._sum.total       ?? 0,
      prevProductionTotal: prevProdAgg._sum.total   ?? 0,
      productionByDesign:  prodByDesign.map(r => ({ design: r.design, total: r._sum.total ?? 0 })),

      trimmerTotal: trimmerAgg._sum.value ?? 0,
      buffingTotal: buffingAgg._sum.value ?? 0,
      repairTotal:  repairAgg._sum.value  ?? 0,

      packedTotal:  packedAgg._sum.value ?? 0,
      packedByItem: packedByItem.map(r => ({ item: r.item, value: r._sum.value ?? 0 })),

      salesTotal:  saleAgg._sum.value ?? 0,
      salesByItem: saleByItem.map(r => ({ item: r.item, value: r._sum.value ?? 0 })),

      evaTotal: quantityAgg._sum.value ?? 0,

      labourTotal:     labourAgg._sum.amount     ?? 0,
      prevLabourTotal: prevLabourAgg._sum.amount ?? 0,
      miscTotal:       miscAgg._sum.amount       ?? 0,
      prevMiscTotal:   prevMiscAgg._sum.amount   ?? 0,
    };
  },
};

export type SummaryAggregates = Awaited<ReturnType<typeof kpiRepository.getSummaryAggregates>>;
