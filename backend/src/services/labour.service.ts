import prisma from '../prisma/client';
import { CreateLabourInput } from '../schemas/labour.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

export class LabourService {
  async create(data: CreateLabourInput) {
    return prisma.labour.create({ data });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.labour.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.labour.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.labour.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.labour.delete({ where: { id } });
  }
}

export const labourService = new LabourService();
