import { createMiscSchema } from '../schemas/misc.schema';
import { miscService } from '../services/misc.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      miscService,
  createSchema: createMiscSchema,
});
