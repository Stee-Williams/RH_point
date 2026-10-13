import { useQuery } from '@tanstack/react-query';
import { rapportService } from '../services/rapportService';
import type { RapportParams } from '../types/rapport';
export function useRapportPresence(params: RapportParams, enabled: boolean) {
  return useQuery({
    queryKey: ['rapport-presence', params],
    queryFn: () => rapportService.presence(params),
    enabled,
  });
}
