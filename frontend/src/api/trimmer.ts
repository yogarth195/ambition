import { api } from './base';
import { QueryParams } from './params';
import type { CreateTrimmerFormInput } from '../schemas/trimmer.schema';

export const trimmerApi = {
  create: async (data: CreateTrimmerFormInput) => {
    const res = await api.post('/trimmer', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/trimmer', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/trimmer/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateTrimmerFormInput>) => {
    const res = await api.put(`/trimmer/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/trimmer/${id}`);
    return res.data;
  },
};
