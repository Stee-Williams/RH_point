import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
export function useDashboardSummary(date?: string) {
  return useQuery({
    queryKey: ['dashboard-summary', date],
    queryFn: () => dashboardService.summary(date),
  });
}
export function useStatistiquesMensuelles(mois?: string) {
  return useQuery({
    queryKey: ['dashboard-stats-mensuelles', mois],
    queryFn: () => dashboardService.statistiquesMensuelles(mois),
  });
}
