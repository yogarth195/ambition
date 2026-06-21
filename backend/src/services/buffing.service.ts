import prisma from '../prisma/client';
import { CreateBuffingInput } from '../schemas/buffing.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

export class BuffingService {
  async create(data: CreateBuffingInput) {
    return prisma.buffing.create({
      data: {
        ...data,
        finalValue: data.value + (data.lastMonthRemaining ?? 0),
      },
    });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.buffing.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.buffing.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.buffing.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.buffing.delete({ where: { id } });
  }
}

export const buffingService = new BuffingService();
