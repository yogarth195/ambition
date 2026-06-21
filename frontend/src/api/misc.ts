import { api } from './base';
import { QueryParams } from './params';
import type { CreateMiscFormInput } from '../schemas/misc.schema';

export const miscApi = {
  create: async (data: CreateMiscFormInput) => {
    const res = await api.post('/misc', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/misc', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/misc/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateMiscFormInput>) => {
    const res = await api.put(`/misc/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/misc/${id}`);
    return res.data;
  },
};
