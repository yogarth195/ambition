import { Packed, Prisma } from '@prisma/client';
import prisma from '../prisma/client';
import { createBaseRepository } from './base.repository';

export const packedRepository =
  createBaseRepository<Packed, Prisma.PackedUncheckedCreateInput>(prisma.packed);
