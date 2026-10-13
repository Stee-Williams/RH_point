export type EmployeStatut = 'actif' | 'inactif' | 'suspendu';
export interface EmployeReference {
  id: number;
  nom: string;
}
export interface Employe {
  id: number;
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  dateNaissance: string | null;
  dateEmbauche: string;
  poste: string | null;
  statut: EmployeStatut;
  service: EmployeReference | null;
  horaire: EmployeReference | null;
}
export interface EmployeCreatePayload {
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  dateNaissance?: string;
  dateEmbauche: string;
  poste?: string;
  serviceId?: number;
  horaireId?: number;
}
export interface EmployeUpdatePayload {
  nom: string;
  prenom: string;
  telephone?: string;
  dateNaissance?: string;
  dateEmbauche: string;
  poste?: string;
  serviceId?: number;
  horaireId?: number;
  statut: EmployeStatut;
}
export interface EmployeListParams {
  q?: string;
  serviceId?: number;
  statut?: EmployeStatut | '';
  page?: number;
  limit?: number;
}
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PaginatedEmployes {
  items: Employe[];
  meta: PaginatedMeta;
}
