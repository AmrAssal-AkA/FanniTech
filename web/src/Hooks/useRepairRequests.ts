import useSWR from "swr";
import {
  fetchRepairRequests,
  convertRequestToTicket,
  rejectRepairRequest,
  quickAcceptRequest,
  type FetchRequestsResponse,
} from "@/services/requests.service";
import type {
  TriageConversionPayload,
  RejectRequestPayload,
  RequestFilterTab,
} from "@/types/requests";

export function useRepairRequests(activeFilter: RequestFilterTab = "ALL", searchQuery = "") {
  const cacheKey = `/api/admin/requests?status=${activeFilter}&q=${encodeURIComponent(searchQuery)}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<FetchRequestsResponse>(
    cacheKey,
    () => fetchRepairRequests(activeFilter, searchQuery),
    {
      revalidateOnFocus: true,
      refreshInterval: 12000, // 12 seconds live feed polling
      keepPreviousData: true,
    }
  );

  const convertToTicket = async (payload: TriageConversionPayload) => {
    try {
      const res = await convertRequestToTicket(payload);
      await mutate();
      return res;
    } catch (err) {
      console.error("Failed to convert request to ticket:", err);
      throw err;
    }
  };

  const rejectRequest = async (payload: RejectRequestPayload) => {
    try {
      const res = await rejectRepairRequest(payload);
      await mutate();
      return res;
    } catch (err) {
      console.error("Failed to reject repair request:", err);
      throw err;
    }
  };

  const quickAccept = async (requestId: string) => {
    try {
      const res = await quickAcceptRequest(requestId);
      await mutate();
      return res;
    } catch (err) {
      console.error("Failed to quick accept request:", err);
      throw err;
    }
  };

  return {
    requests: data?.requests || [],
    metrics: data?.metrics,
    technicians: data?.technicians || [],
    isLoading,
    isValidating,
    isError: !!error,
    error,
    mutate,
    convertToTicket,
    rejectRequest,
    quickAccept,
  };
}
