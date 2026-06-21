import prisma from '../prisma/client';
import { CreateRepairInput } from '../schemas/repair.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

export class RepairService {
  async create(data: CreateRepairInput) {
    return prisma.repair.create({ data });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.repair.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.repair.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.repair.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.repair.delete({ where: { id } });
  }
}

export const repairService = new RepairService();
