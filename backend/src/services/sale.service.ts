import prisma from '../prisma/client';

export class SaleService {
  async create(data: any) {
    return prisma.sale.create({ data });
  }

  async getAll(startDate?: string, endDate?: string) {
    return prisma.sale.findMany({
      where: startDate && endDate ? { date: { gte: new Date(startDate), lte: new Date(endDate) } } : undefined,
      orderBy: { date: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.sale.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.sale.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.sale.delete({ where: { id } });
  }
}

export const saleService = new SaleService();
