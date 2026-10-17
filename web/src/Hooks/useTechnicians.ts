import useSWR from "swr";
import { fetchListTechnicians } from "@/services/technicians.service";
import type { BackendTechnicianItem } from "@/types/technicians";

export function useTechnicians() {
  const cacheKey = "/api/admin/technicians/getListTechnician";

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    BackendTechnicianItem[]
  >(cacheKey, () => fetchListTechnicians(), {
    revalidateOnFocus: true,
    refreshInterval: 15000,
    keepPreviousData: true,
    shouldRetryOnError: (err) => {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("session expired")) {
        return false;
      }
      return true;
    },
  });

  return {
    rawTechnicians: data ?? [],
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}

