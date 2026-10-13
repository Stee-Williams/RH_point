import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type {
  Employe,
  EmployeCreatePayload,
  EmployeListParams,
  EmployeUpdatePayload,
  PaginatedEmployes,
} from '../types/employe';
interface EmployeListApiResponse {
  success: true;
  data: Employe[];
  meta: PaginatedEmployes['meta'];
}
export const employeService = {
  async list(params: EmployeListParams): Promise<PaginatedEmployes> {
    const response = await api.get<EmployeListApiResponse>('/employees', {
      params: {
        q: params.q || undefined,
        serviceId: params.serviceId || undefined,
        statut: params.statut || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return { items: response.data.data, meta: response.data.meta };
  },
  async get(id: number): Promise<Employe> {
    const response = await api.get<ApiResponse<Employe>>(`/employees/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },

  async create(payload: EmployeCreatePayload): Promise<{ employe: Employe; motDePasseTemporaire: string }> {
    const response = await api.post<ApiResponse<{ employe: Employe; motDePasseTemporaire: string }>>(
      '/employees',
      payload
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },

  async update(id: number, payload: EmployeUpdatePayload): Promise<Employe> {
    const response = await api.put<ApiResponse<Employe>>(`/employees/${id}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};
