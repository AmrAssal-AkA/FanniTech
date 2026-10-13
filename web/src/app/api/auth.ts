import axios from "axios";
import type { LoginCredentials, LoginResponse } from "@/types/auth";
import type { SessionResponse } from "@/types/session";
import {appClient} from "@/lib/appClient";

export const postStaffLogin = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await appClient.post<LoginResponse>("/api/auth/login", credentials);
  return response.data;
};

export const postStaffLogout = async (): Promise<void> => {
  await appClient.post("/api/auth/logout");
};

export const getStaffSession = async (): Promise<SessionResponse> => {
  const response = await appClient.get<SessionResponse>("/api/auth/session");
  return response.data;
};

export const postStaffRefresh = async (): Promise<SessionResponse> => {
  await appClient.post("/api/auth/refresh");
  return getStaffSession();
};
