import { Prisma, Production } from '@prisma/client';
import { prevMonth, requireMonthExists } from '../lib/monthGuards';
import { productionRepository } from '../repositories/production.repository';
import { CreateProductionInput } from '../schemas/production.schema';
import { createCrudService } from './base.service';

const base = createCrudService<Production, Prisma.ProductionUncheckedCreateInput>(
  productionRepository,
  'Production',
);

export const productionService = {
  ...base,

  /** Months must be filled in order — the previous month has to exist first. */
  async create(data: CreateProductionInput) {
    await requireMonthExists(productionRepository, prevMonth(data.monthBelongs), 'Production');
    return base.create(data);
  },
};
