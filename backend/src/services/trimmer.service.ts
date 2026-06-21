import prisma from '../prisma/client';
import { CreateTrimmerInput } from '../schemas/trimmer.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

export class TrimmerService {
  async create(data: CreateTrimmerInput) {
    return prisma.trimmer.create({
      data: {
        ...data,
        finalValue: data.value + (data.lastMonthRemaining ?? 0),
      },
    });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.trimmer.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.trimmer.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.trimmer.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.trimmer.delete({ where: { id } });
  }
}

export const trimmerService = new TrimmerService();
