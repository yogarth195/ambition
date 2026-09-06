import { Misc, Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const miscRepository =
  createBaseRepository<Misc, Prisma.MiscUncheckedCreateInput>(prisma.misc);
