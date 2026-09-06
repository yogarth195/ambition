import { Packed, Prisma } from '@prisma/client';
import { packedRepository } from '../repositories/packed.repository';
import { createCrudService } from './base.service';

export const packedService = createCrudService<Packed, Prisma.PackedUncheckedCreateInput>(
  packedRepository,
  'Packed',
);
