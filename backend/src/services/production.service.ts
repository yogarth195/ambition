import prisma from '../prisma/client';
import { CreateProductionInput } from '../schemas/production.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';
import { prevMonth, requireMonthExists } from '../lib/monthGuards';

export class ProductionService {
  async create(data: CreateProductionInput) {
    await requireMonthExists(prisma.production, prevMonth(data.monthBelongs), 'Production');
    return prisma.production.create({ data });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.production.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.production.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.production.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.production.delete({ where: { id } });
  }
}

export const productionService = new ProductionService();
