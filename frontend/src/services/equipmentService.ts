import { api } from './api';
import { Equipment, EquipmentWithHistory, EquipmentFilters } from '../types';

export const equipmentService = {
  getAll: async (filters?: EquipmentFilters): Promise<Equipment[]> => {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const { data } = await api.get<Equipment[]>(`/equipments?${params.toString()}`);
    return data;
  },

  getById: async (id: string): Promise<EquipmentWithHistory> => {
    const { data } = await api.get<EquipmentWithHistory>(`/equipments/${id}`);
    return data;
  },

  create: async (equipment: Partial<Equipment>): Promise<Equipment> => {
    const { data } = await api.post<Equipment>('/equipments', equipment);
    return data;
  },

  update: async (id: string, equipment: Partial<Equipment>): Promise<Equipment> => {
    const { data } = await api.put<Equipment>(`/equipments/${id}`, equipment);
    return data;
  },

  updateStatus: async (id: string, status: string, description: string): Promise<Equipment> => {
    const { data } = await api.patch<Equipment>(`/equipments/${id}/status`, { status, description });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/equipments/${id}`);
  },
};
