import prisma from '../prisma/client';
import { CreatePackedInput } from '../schemas/packed.schema';
import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

export class PackedService {
  async create(data: CreatePackedInput) {
    return prisma.packed.create({ data });
  }

  async getAll(params: QueryParams = {}) {
    return prisma.packed.findMany(buildQueryArgs(params));
  }

  async getById(id: string) {
    return prisma.packed.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.packed.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.packed.delete({ where: { id } });
  }
}

export const packedService = new PackedService();
