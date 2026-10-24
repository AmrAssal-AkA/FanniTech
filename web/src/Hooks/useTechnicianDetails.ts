import useSWR from "swr";
import { fetchTechnicianById } from "@/services/technicians.service";
import type { DetailedTechnicianData } from "@/types/technicians";

export function useTechnicianDetails(technicianId?: string | null) {
  const cacheKey = technicianId
    ? `/api/admin/technicians/${technicianId}`
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    DetailedTechnicianData
  >(cacheKey, () => fetchTechnicianById(technicianId!), {
    revalidateOnFocus: true,
    keepPreviousData: true,
    shouldRetryOnError: (err) => {
      const msg = String(err?.message || "").toLowerCase();
      if (
        msg.includes("unauthorized") ||
        msg.includes("session expired") ||
        msg.includes("not found")
      ) {
        return false;
      }
      return true;
    },
  });

  return {
    technician: data ?? null,
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}

