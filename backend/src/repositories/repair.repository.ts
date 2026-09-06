import { Prisma, Repair } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const repairRepository =
  createBaseRepository<Repair, Prisma.RepairUncheckedCreateInput>(prisma.repair);
