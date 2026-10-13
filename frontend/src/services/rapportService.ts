import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { RapportAbsencesLigne, RapportParams, RapportPresenceLigne } from '../types/rapport';
function toQueryParams(params: RapportParams) {
  return {
    dateDebut: params.dateDebut,
    dateFin: params.dateFin,
    serviceId: params.serviceId || undefined,
    employeId: params.employeId || undefined,
  };
}
export const rapportService = {
  async presence(params: RapportParams): Promise<RapportPresenceLigne[]> {
    const response = await api.get<ApiResponse<RapportPresenceLigne[]>>('/rapports/presence', {
      params: toQueryParams(params),
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  async absences(params: RapportParams): Promise<RapportAbsencesLigne[]> {
    const response = await api.get<ApiResponse<RapportAbsencesLigne[]>>('/rapports/absences', {
      params: toQueryParams(params),
    });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  /**
   * Téléchargement PDF — nécessite dompdf/dompdf côté backend (voir RapportPdfService).
   */
  async presencePdfBlob(params: RapportParams): Promise<Blob> {
    const response = await api.get('/rapports/presence/pdf', {
      params: toQueryParams(params),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
  /**
   * Téléchargement Excel — nécessite phpoffice/phpspreadsheet côté backend (voir RapportExcelService).
   */
  async presenceExcelBlob(params: RapportParams): Promise<Blob> {
    const response = await api.get('/rapports/presence/excel', {
      params: toQueryParams(params),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
