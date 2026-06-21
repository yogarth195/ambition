import { api } from './base';
import { QueryParams } from './params';
import type { CreateLabourFormInput } from '../schemas/labour.schema';

export const labourApi = {
  create: async (data: CreateLabourFormInput) => {
    const res = await api.post('/labour', data);
    return res.data;
  },
  getAll: async (params?: QueryParams) => {
    const res = await api.get('/labour', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/labour/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateLabourFormInput>) => {
    const res = await api.put(`/labour/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/labour/${id}`);
    return res.data;
  },
};
