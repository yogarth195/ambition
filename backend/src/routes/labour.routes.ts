import { createLabourSchema } from '../schemas/labour.schema';
import { labourService } from '../services/labour.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      labourService,
  createSchema: createLabourSchema,
});
