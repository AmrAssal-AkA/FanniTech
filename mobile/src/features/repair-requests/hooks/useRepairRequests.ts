import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RepairRequestsService } from '../services/RepairRequestsService';
import { RepairRequestsQuery } from '../types';

export const REPAIR_REQUESTS_QUERY_KEY = ['repair-requests'] as const;

export function useGetRepairRequests(query: RepairRequestsQuery = {}) {
  return useQuery({
    queryKey: [...REPAIR_REQUESTS_QUERY_KEY, query],
    queryFn: () => RepairRequestsService.listRequests(query),
  });
}

export function useGetRepairRequestById(requestId: string) {
  return useQuery({
    queryKey: [...REPAIR_REQUESTS_QUERY_KEY, 'detail', requestId],
    queryFn: () => RepairRequestsService.getRequestById(requestId),
    enabled: Boolean(requestId),
  });
}

export function useCancelRepairRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RepairRequestsService.cancelRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPAIR_REQUESTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}
