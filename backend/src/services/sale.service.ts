import { Prisma, Sale } from '@prisma/client';
import { saleRepository } from '../repositories/sale.repository';
import { createCrudService } from './base.service';

/**
 * Sale has no monthBelongs column, so its repository filters on entryDate only
 * — see sale.repository.ts.
 */
export const saleService = createCrudService<Sale, Prisma.SaleUncheckedCreateInput>(
  saleRepository,
  'Sale',
);
