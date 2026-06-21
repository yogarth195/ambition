import { api } from './base';
import { QueryParams } from './params';
import type { CreateRepairFormInput } from '../schemas/repair.schema';

export const repairApi = {
  create: async (data: CreateRepairFormInput) => {
    const res = await api.post('/repair', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/repair', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/repair/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateRepairFormInput>) => {
    const res = await api.put(`/repair/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/repair/${id}`);
    return res.data;
  },
};
