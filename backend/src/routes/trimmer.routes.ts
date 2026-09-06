import { createTrimmerSchema } from '../schemas/trimmer.schema';
import { trimmerService } from '../services/trimmer.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      trimmerService,
  createSchema: createTrimmerSchema,
});
