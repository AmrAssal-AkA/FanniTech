import useSWR from "swr";
import { fetchAdminDashboard } from "@/services/dashboard.service";
import type { AdminDashboardData } from "@/types/dashboard";

export function useAdminDashboard() {
  const { data, error, isLoading, mutate } = useSWR<AdminDashboardData>(
    "/api/admin/dashboard",
    fetchAdminDashboard,
    {
      revalidateOnFocus: true,
      refreshInterval: 15000,
    }
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
