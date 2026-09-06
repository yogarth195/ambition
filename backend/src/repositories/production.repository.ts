import { Prisma, Production } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const productionRepository =
  createBaseRepository<Production, Prisma.ProductionUncheckedCreateInput>(prisma.production);
