import axios from "axios";
import type { AdminDashboardData } from "@/types/dashboard";

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const response = await axios.get<AdminDashboardData>("/api/admin/dashboard");
  return response.data;
};
