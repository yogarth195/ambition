import { createBuffingSchema } from '../schemas/buffing.schema';
import { buffingService } from '../services/buffing.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      buffingService,
  createSchema: createBuffingSchema,
});
