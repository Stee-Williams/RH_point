import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { PaginatedPointages, Pointage, PointageActionPayload, PointageListParams } from '../types/pointage';
interface PointageListApiResponse {
  success: true;
  data: Pointage[];
  meta: PaginatedPointages['meta'];
}
export const pointageService = {
  async clockIn(payload: PointageActionPayload = {}): Promise<Pointage> {
    const response = await api.post<ApiResponse<Pointage>>('/pointages/arrivee', payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  async clockOut(payload: PointageActionPayload = {}): Promise<Pointage> {
    const response = await api.post<ApiResponse<Pointage>>('/pointages/depart', payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  async today(): Promise<Pointage | null> {
    const response = await api.get<ApiResponse<Pointage | null>>('/pointages/aujourdhui');
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  async list(params: PointageListParams): Promise<PaginatedPointages> {
    const response = await api.get<PointageListApiResponse>('/pointages', {
      params: {
        employeId: params.employeId || undefined,
        serviceId: params.serviceId || undefined,
        dateDebut: params.dateDebut || undefined,
        dateFin: params.dateFin || undefined,
        statut: params.statut || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return { items: response.data.data, meta: response.data.meta };
  },
};
