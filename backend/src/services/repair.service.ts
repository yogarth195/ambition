import { Prisma, Repair } from '@prisma/client';
import { repairRepository } from '../repositories/repair.repository';
import { createCrudService } from './base.service';

export const repairService = createCrudService<Repair, Prisma.RepairUncheckedCreateInput>(
  repairRepository,
  'Repair',
);
