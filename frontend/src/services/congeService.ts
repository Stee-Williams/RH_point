import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type {
  Conge,
  CongeCreatePayload,
  CongeDecisionPayload,
  CongeListParams,
  PaginatedConges,
} from '../types/conge';
interface CongeListApiResponse {
  success: true;
  data: Conge[];
  meta: PaginatedConges['meta'];
}
export const congeService = {
  async list(params: CongeListParams): Promise<PaginatedConges> {
    const response = await api.get<CongeListApiResponse>('/conges', {
      params: {
        employeId: params.employeId || undefined,
        serviceId: params.serviceId || undefined,
        statut: params.statut || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return { items: response.data.data, meta: response.data.meta };
  },
  async create(payload: CongeCreatePayload): Promise<Conge> {
    const response = await api.post<ApiResponse<Conge>>('/conges', payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  async approve(id: number, payload: CongeDecisionPayload = {}): Promise<Conge> {
    const response = await api.put<ApiResponse<Conge>>(`/conges/${id}/approuver`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },

  async reject(id: number, payload: CongeDecisionPayload = {}): Promise<Conge> {
    const response = await api.put<ApiResponse<Conge>>(`/conges/${id}/refuser`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
};
