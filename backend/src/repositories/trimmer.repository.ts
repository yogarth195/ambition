import { Prisma, Trimmer } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const trimmerRepository =
  createBaseRepository<Trimmer, Prisma.TrimmerUncheckedCreateInput>(prisma.trimmer);
