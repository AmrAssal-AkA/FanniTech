import axios from "axios";
import type { LoginCredentials, LoginResponse, User } from "@/types/auth";
import { appClient } from "@/lib/appClient";

interface AuthApiResponse<T> { success: boolean; data?: T; message?: string; }

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return error instanceof Error ? error.message : fallback;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await appClient.post<AuthApiResponse<LoginResponse>>("/api/auth/login", credentials);
      if (!data.success || !data.data) throw new Error("Invalid login response");
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Authentication failed"));
    }
  },
  async me(): Promise<AuthApiResponse<User>> {
    const { data } = await appClient.get<AuthApiResponse<User>>("/api/auth/me");
    return data;
  },
  async refresh(): Promise<void> { await appClient.post("/api/auth/refresh"); },
  async logout(): Promise<void> { await appClient.post("/api/auth/logout"); },
};

export const authenticateStaff = authService.login;
