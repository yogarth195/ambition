import prisma from '../prisma/client';
import { CreateMiscInput } from '../schemas/misc.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

export class MiscService {
  async create(data: CreateMiscInput) {
    return prisma.misc.create({ data });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.misc.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.misc.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.misc.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.misc.delete({ where: { id } });
  }
}

export const miscService = new MiscService();
