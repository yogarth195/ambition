import { Prisma, Quantity } from '@prisma/client';
import { quantityRepository } from '../repositories/quantity.repository';
import { createCrudService } from './base.service';

export const quantityService = createCrudService<Quantity, Prisma.QuantityUncheckedCreateInput>(
  quantityRepository,
  'Quantity',
);
