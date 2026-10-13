import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeService } from '../services/employeService';
import type { EmployeCreatePayload, EmployeListParams, EmployeUpdatePayload } from '../types/employe';
const EMPLOYES_KEY = 'employes';
export function useEmployesList(params: EmployeListParams) {
  return useQuery({
    queryKey: [EMPLOYES_KEY, params],
    queryFn: () => employeService.list(params),
    placeholderData: keepPreviousData,
  });
}
export function useCreateEmploye() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeCreatePayload) => employeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYES_KEY] });
    },
  });
}
export function useUpdateEmploye() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmployeUpdatePayload }) =>
      employeService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYES_KEY] });
    },
  });
}
export function useDeactivateEmploye() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYES_KEY] });
    },
  });
}
