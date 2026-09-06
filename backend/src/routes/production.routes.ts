import { createProductionSchema } from '../schemas/production.schema';
import { productionService } from '../services/production.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      productionService,
  createSchema: createProductionSchema,
});
