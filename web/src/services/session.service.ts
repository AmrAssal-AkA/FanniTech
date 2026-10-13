import type { LoginResponse } from "@/types/auth";
import {appClient} from "@/lib/appClient";

export const ACCESS_TOKEN_COOKIE = "x-access-token";
export const REFRESH_TOKEN_COOKIE = "x-refresh-token";
export const SESSION_USER_COOKIE = "x-session-user";

export const ACCESS_TOKEN_MAX_AGE = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse extends TokenPair {
  user?: LoginResponse["user"];
}


export async function refreshBackendSession(refreshToken: string): Promise<RefreshResponse> {
  const response = await appClient.post("/api/v1/auth/web/refresh", {
    refreshToken,
  });

  if (!response.data || !response.data.accessToken || !response.data.refreshToken) {
    throw new Error("Invalid response from authentication backend");
  }
  return response.data as RefreshResponse;
}

export async function revokeBackendSession(refreshToken: string): Promise<void> {
  await appClient.post("/api/v1/auth/logout", {
    refreshToken,
  });
}
