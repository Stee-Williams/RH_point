import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { congeService } from '../services/congeService';
import type { CongeCreatePayload, CongeDecisionPayload, CongeListParams } from '../types/conge';
const CONGES_KEY = 'conges';
export function useCongesList(params: CongeListParams) {
  return useQuery({
    queryKey: [CONGES_KEY, params],
    queryFn: () => congeService.list(params),
    placeholderData: keepPreviousData,
  });
}
export function useCreateConge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CongeCreatePayload) => congeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONGES_KEY] });
    },
  });
}
export function useApproveConge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: CongeDecisionPayload }) =>
      congeService.approve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONGES_KEY] });
    },
  });
}
export function useRejectConge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: CongeDecisionPayload }) =>
      congeService.reject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONGES_KEY] });
    },
  });
}
