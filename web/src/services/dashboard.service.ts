import { getAdminDashboardData } from "@/app/api/dashboard";
import type { AdminDashboardData } from "@/types/dashboard";

export const fetchAdminDashboard = async (): Promise<AdminDashboardData> => {
  return getAdminDashboardData();
};
