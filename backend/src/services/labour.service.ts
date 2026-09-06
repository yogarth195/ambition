import { Labour, Prisma } from '@prisma/client';
import { labourRepository } from '../repositories/labour.repository';
import { createCrudService } from './base.service';

export const labourService = createCrudService<Labour, Prisma.LabourUncheckedCreateInput>(
  labourRepository,
  'Labour',
);
