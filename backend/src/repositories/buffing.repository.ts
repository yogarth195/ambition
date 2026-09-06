import { Buffing, Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const buffingRepository =
  createBaseRepository<Buffing, Prisma.BuffingUncheckedCreateInput>(prisma.buffing);
