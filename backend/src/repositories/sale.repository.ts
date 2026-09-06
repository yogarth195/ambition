import { Prisma, Sale } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';
import { QueryParams } from '../lib/queryHelpers';

const base = createBaseRepository<Sale, Prisma.SaleUncheckedCreateInput>(prisma.sale);

/**
 * Sale is the one report model without a `monthBelongs` column, so the shared
 * month filtering and month guards don't apply to it — it is filtered by
 * entryDate only.
 */
export const saleRepository = {
  ...base,

  findMany({ startDate, endDate, sortOrder = 'desc', page = 1, pageSize = 50 }: QueryParams = {}) {
    return prisma.sale.findMany({
      where:
        startDate && endDate
          ? { entryDate: { gte: new Date(startDate), lte: new Date(endDate) } }
          : {},
      orderBy: { entryDate: sortOrder },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    });
  },

  async existsForMonth(): Promise<boolean> {
    return false;
  },
};
