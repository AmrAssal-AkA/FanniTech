"use client";

import useSWR from "swr";
import {
  fetchTechnicianDashboardData,
  initialTechnicianDashboardData,
} from "@/services/technicianDashboard.service";
import type { TechnicianDashboardData } from "@/types/technicianDashboard";

export function useTechnicianDashboard() {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<TechnicianDashboardData>(
      "/api/technician/workbench",
      fetchTechnicianDashboardData,
      {
        fallbackData: initialTechnicianDashboardData,
        revalidateOnFocus: true,
        refreshInterval: 15000,
        keepPreviousData: true,
      }
    );

  return {
    data: data || initialTechnicianDashboardData,
    isLoading: isLoading && !data,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}

