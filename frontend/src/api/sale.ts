import { api } from './base';
import type { QueryParams } from './params';

export interface CreateSaleInput {
  item: string;
  value: number;
  entryDate: string;
}

export const saleApi = {
  create: async (data: CreateSaleInput) => {
    const res = await api.post('/sale', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/sale', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/sale/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateSaleInput>) => {
    const res = await api.put(`/sale/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/sale/${id}`);
    return res.data;
  },
};
