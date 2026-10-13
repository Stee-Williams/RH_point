import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pointageService } from '../services/pointageService';
import type { PointageActionPayload, PointageListParams } from '../types/pointage';
const POINTAGES_KEY = 'pointages';
const POINTAGE_TODAY_KEY = 'pointage-today';
export function useTodayPointage() {
  return useQuery({
    queryKey: [POINTAGE_TODAY_KEY],
    queryFn: pointageService.today,
  });
}
export function usePointagesList(params: PointageListParams) {
  return useQuery({
    queryKey: [POINTAGES_KEY, params],
    queryFn: () => pointageService.list(params),
    placeholderData: keepPreviousData,
  });
}
export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: PointageActionPayload) => pointageService.clockIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POINTAGE_TODAY_KEY] });
      queryClient.invalidateQueries({ queryKey: [POINTAGES_KEY] });
    },
  });
}
export function useClockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: PointageActionPayload) => pointageService.clockOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POINTAGE_TODAY_KEY] });
      queryClient.invalidateQueries({ queryKey: [POINTAGES_KEY] });
    },
  });
}
