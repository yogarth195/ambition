import { api } from './base';
import { QueryParams } from './params';
import type { CreateQuantityFormInput } from '../schemas/quantity.schema';

export const quantityApi = {
  create: async (data: CreateQuantityFormInput) => {
    const res = await api.post('/quantity', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/quantity', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/quantity/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateQuantityFormInput>) => {
    const res = await api.put(`/quantity/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/quantity/${id}`);
    return res.data;
  },
};
