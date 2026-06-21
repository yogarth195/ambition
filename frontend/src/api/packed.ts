import { api } from './base';
import { QueryParams } from './params';
import type { CreatePackedFormInput } from '../schemas/packed.schema';

export const packedApi = {
  create: async (data: CreatePackedFormInput) => {
    const res = await api.post('/packed', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/packed', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/packed/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreatePackedFormInput>) => {
    const res = await api.put(`/packed/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/packed/${id}`);
    return res.data;
  },
};
