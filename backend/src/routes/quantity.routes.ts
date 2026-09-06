import { createQuantitySchema } from '../schemas/quantity.schema';
import { quantityService } from '../services/quantity.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      quantityService,
  createSchema: createQuantitySchema,
});
