import { api } from './base';
import { QueryParams } from './params';
import type { CreateProductionFormInput } from '../schemas/production.schema';

export const productionApi = {
  create: async (data: CreateProductionFormInput) => {
    const res = await api.post('/production', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/production', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/production/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateProductionFormInput>) => {
    const res = await api.put(`/production/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/production/${id}`);
    return res.data;
  },
};
