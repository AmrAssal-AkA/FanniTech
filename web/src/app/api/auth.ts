import axios from "axios";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

export const postStaffLogin = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>("/api/auth/login", credentials);
  return response.data;
};
