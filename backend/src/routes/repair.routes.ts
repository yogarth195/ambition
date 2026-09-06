import { createRepairSchema } from '../schemas/repair.schema';
import { repairService } from '../services/repair.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      repairService,
  createSchema: createRepairSchema,
});
