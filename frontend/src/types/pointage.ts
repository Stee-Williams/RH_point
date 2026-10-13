export type PointageStatut = 'present' | 'absent' | 'retard' | 'depart_anticipe';
export type PointageMethode = 'bouton' | 'qr_code' | 'badge_rfid' | 'biometrique';
export interface PointageEmployeRef {
  id: number;
  nom: string;
  prenom: string;
}
export interface Pointage {
  id: number;
  employe: PointageEmployeRef;
  datePointage: string;
  heureArrivee: string | null;
  heureDepart: string | null;
  methode: PointageMethode;
  retardMinutes: number;
  heuresSupplementairesMinutes: number;
  statut: PointageStatut;
}
export interface PointageActionPayload {
  methode?: PointageMethode;
  latitude?: number;
  longitude?: number;
}
export interface PointageListParams {
  employeId?: number;
  serviceId?: number;
  dateDebut?: string;
  dateFin?: string;
  statut?: PointageStatut | '';
  page?: number;
  limit?: number;
}
export interface PaginatedPointagesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PaginatedPointages {
  items: Pointage[];
  meta: PaginatedPointagesMeta;
}
