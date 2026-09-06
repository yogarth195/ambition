import { Misc, Prisma } from '@prisma/client';
import { miscRepository } from '../repositories/misc.repository';
import { createCrudService } from './base.service';

export const miscService = createCrudService<Misc, Prisma.MiscUncheckedCreateInput>(
  miscRepository,
  'Misc',
);
