import { Prisma, Trimmer } from '@prisma/client';
import { trimmerRepository } from '../repositories/trimmer.repository';
import { CreateTrimmerInput } from '../schemas/trimmer.schema';
import { createCrudService } from './base.service';

const base = createCrudService<Trimmer, Prisma.TrimmerUncheckedCreateInput>(
  trimmerRepository,
  'Trimmer',
);

export const trimmerService = {
  ...base,

  /** finalValue is derived, never accepted from the client. */
  create(data: CreateTrimmerInput) {
    return base.create({
      ...data,
      finalValue: data.value + (data.lastMonthRemaining ?? 0),
    });
  },
};
