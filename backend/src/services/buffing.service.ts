import { Buffing, Prisma } from '@prisma/client';
import { buffingRepository } from '../repositories/buffing.repository';
import { CreateBuffingInput } from '../schemas/buffing.schema';
import { createCrudService } from './base.service';

const base = createCrudService<Buffing, Prisma.BuffingUncheckedCreateInput>(
  buffingRepository,
  'Buffing',
);

export const buffingService = {
  ...base,

  /** finalValue is derived, never accepted from the client. */
  create(data: CreateBuffingInput) {
    return base.create({
      ...data,
      finalValue: data.value + (data.lastMonthRemaining ?? 0),
    });
  },
};
