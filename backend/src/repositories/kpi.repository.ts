import prisma from '../prisma/client';

export interface DateRange {
  start: Date;
  end:   Date;
}

function where(range: DateRange) {
  return { entryDate: { gte: range.start, lte: range.end } };
}

/**
 * Every aggregate the KPI summary needs, fetched in one round trip. The service
 * owns the arithmetic; this layer only owns the queries.
 */
export const kpiRepository = {
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
