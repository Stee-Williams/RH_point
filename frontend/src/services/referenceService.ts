import { api } from './api';
export interface ServiceOption {
  id: number;
  nom: string;
}
export interface HoraireOption {
  id: number;
  nom: string;
  heureDebut: string;
  heureFin: string;
}
/**
 * Listes en lecture seule utilisées pour peupler les listes déroulantes du formulaire
 * Employé. La gestion complète (CRUD) de ces ressources arrivera avec le module
 * "Services & Horaires".
 */
export const referenceService = {
  async listServices(): Promise<ServiceOption[]> {
    const response = await api.get<{ success: boolean; data: ServiceOption[] }>('/services');
    return response.data.data;
  },
  async listHoraires(): Promise<HoraireOption[]> {
    const response = await api.get<{ success: boolean; data: HoraireOption[] }>('/horaires');
    return response.data.data;
  },
};
