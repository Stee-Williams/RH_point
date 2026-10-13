import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { DashboardSummary, StatistiqueMensuelleEmploye } from '../types/dashboard';
export const dashboardService = {
  async summary(date?: string): Promise<DashboardSummary> {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary', {
      params: { date: date || undefined },
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  async statistiquesMensuelles(mois?: string): Promise<StatistiqueMensuelleEmploye[]> {
    const response = await api.get<ApiResponse<StatistiqueMensuelleEmploye[]>>('/dashboard/stats-mensuelles', {
      params: { mois: mois || undefined },
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
};
