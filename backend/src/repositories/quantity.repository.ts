import { Prisma, Quantity } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const quantityRepository =
  createBaseRepository<Quantity, Prisma.QuantityUncheckedCreateInput>(prisma.quantity);
