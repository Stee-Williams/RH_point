export interface RapportPresenceLigne {
  employeId: number;
  nom: string;
  prenom: string;
  service: string | null;
  joursPresents: number;
  nbRetards: number;
  nbDepartsAnticipes: number;
  totalRetardMinutes: number;
  totalHsMinutes: number;
}
export interface RapportAbsencesLigne {
  employeId: number;
  nom: string;
  prenom: string;
  service: string | null;
  absencesJustifiees: number;
  absencesNonJustifiees: number;
}
export interface RapportParams {
  dateDebut: string;
  dateFin: string;
  serviceId?: number;
  employeId?: number;
}
