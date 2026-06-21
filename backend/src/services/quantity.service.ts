import prisma from '../prisma/client';
import { CreateQuantityInput } from '../schemas/quantity.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

export class QuantityService {
  async create(data: CreateQuantityInput) {
    return prisma.quantity.create({ data });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.quantity.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.quantity.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.quantity.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.quantity.delete({ where: { id } });
  }
}

export const quantityService = new QuantityService();
