export interface DashboardSummary {
  date: string;
  nbPresents: number;
  nbRetards: number;
  nbDepartsAnticipes: number;
  nbAbsentsEstimes: number;
}
export interface StatistiqueMensuelleEmploye {
  employeId: number;
  nom: string;
  prenom: string;
  mois: string;
  joursPresents: number;
  nbRetards: number;
  totalMinutesRetard: number;
  totalMinutesHs: number;
}
