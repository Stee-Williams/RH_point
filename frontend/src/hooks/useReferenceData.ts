import { useQuery } from '@tanstack/react-query';
import { referenceService } from '../services/referenceService';
const FIVE_MINUTES = 5 * 60 * 1000;
export function useServiceOptions() {
  return useQuery({
    queryKey: ['services'],
    queryFn: referenceService.listServices,
    staleTime: FIVE_MINUTES,
  });
}
export function useHoraireOptions() {
  return useQuery({
    queryKey: ['horaires'],
    queryFn: referenceService.listHoraires,
    staleTime: FIVE_MINUTES,
  });
}
