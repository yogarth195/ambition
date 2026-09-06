import { Labour, Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const labourRepository =
  createBaseRepository<Labour, Prisma.LabourUncheckedCreateInput>(prisma.labour);
