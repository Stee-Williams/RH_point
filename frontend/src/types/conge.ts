export type CongeType = 'conge_annuel' | 'permission' | 'absence_justifiee';
export type CongeStatut = 'en_attente' | 'approuvee' | 'refusee';
export interface CongeEmployeRef {
  id: number;
  nom: string;
  prenom: string;
}
export interface Conge {
  id: number;
  employe: CongeEmployeRef;
  typeConge: CongeType;
  dateDebut: string;
  dateFin: string;
  motif: string | null;
  justificatifUrl: string | null;
  statut: CongeStatut;
  validePar: string | null;
  dateDemande: string;
  dateTraitement: string | null;
  commentaireValidation: string | null;
}
export interface CongeCreatePayload {
  typeConge: CongeType;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  justificatifUrl?: string;
}
export interface CongeDecisionPayload {
  commentaireValidation?: string;
}
export interface CongeListParams {
  employeId?: number;
  serviceId?: number;
  statut?: CongeStatut | '';
  page?: number;
  limit?: number;
}
export interface PaginatedCongesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PaginatedConges {
  items: Conge[];
  meta: PaginatedCongesMeta;
}
