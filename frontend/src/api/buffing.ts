import { api } from './base';
import { QueryParams } from './params';
import type { CreateBuffingFormInput } from '../schemas/buffing.schema';

export const buffingApi = {
  create: async (data: CreateBuffingFormInput) => {
    const res = await api.post('/buffing', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/buffing', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/buffing/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateBuffingFormInput>) => {
    const res = await api.put(`/buffing/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/buffing/${id}`);
    return res.data;
  },
};
