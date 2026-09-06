import { createSaleSchema } from '../schemas/sale.schema';
import { saleService } from '../services/sale.service';
import { createCrudRouter } from './crudRouter';

export default createCrudRouter({
  service:      saleService,
  createSchema: createSaleSchema,
});
