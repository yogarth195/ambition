import { createPackedSchema } from '../schemas/packed.schema';
import { packedService } from '../services/packed.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      packedService,
  createSchema: createPackedSchema,
});
