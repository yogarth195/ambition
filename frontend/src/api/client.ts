export { api } from './base';
export type { QueryParams } from './params';

export { productionApi } from './production';
export { trimmerApi }    from './trimmer';
export { buffingApi }    from './buffing';
export { repairApi }     from './repair';
export { packedApi }     from './packed';
export { quantityApi }   from './quantity';
export { labourApi }     from './labour';
export { miscApi }       from './misc';
export { saleApi }       from './sale';

import { api } from './base';

export type KpiQueryParams =
  | { period: 'today' | 'week' | 'month' | 'all' }
  | { startDate: string; endDate: string };

export const kpiApi = {
  getSummary: async (params: KpiQueryParams = { period: 'month' }) => {
    const res = await api.get('/kpi', { params });
    return res.data;
  },
};

// legacy export — keeps existing `apiClient.production.create(...)` calls working
import { productionApi } from './production';
import { trimmerApi }    from './trimmer';
import { buffingApi }    from './buffing';
import { repairApi }     from './repair';
import { packedApi }     from './packed';
import { quantityApi }   from './quantity';
import { labourApi }     from './labour';
import { miscApi }       from './misc';

export const apiClient = {
  production: productionApi,
  trimmer:    trimmerApi,
  buffing:    buffingApi,
  repair:     repairApi,
  packed:     packedApi,
  quantity:   quantityApi,
  labour:     labourApi,
  misc:       miscApi,
};
