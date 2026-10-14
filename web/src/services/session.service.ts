import { serverClient } from "@/lib/serverClient";

export const ACCESS_TOKEN_COOKIE = "x-access-token";
export const REFRESH_TOKEN_COOKIE = "x-refresh-token";
export const ACCESS_TOKEN_MAX_AGE = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export interface TokenPair { accessToken: string; refreshToken: string; }

export async function refreshBackendSession(refreshToken: string): Promise<TokenPair> {
  const { data } = await serverClient.post<TokenPair>("/api/v1/auth/refresh", { refreshToken, service: "web" });
  if (!data.accessToken || !data.refreshToken) throw new Error("Invalid refresh response");
  return data;
}

export function getAuthHeaders(accessToken: string, refreshToken?: string): Record<string, string> {
  const cookieParts = [`${ACCESS_TOKEN_COOKIE}=${accessToken}`];
  if (refreshToken) {
    cookieParts.push(`${REFRESH_TOKEN_COOKIE}=${refreshToken}`);
  }
  return {
    Authorization: `Bearer ${accessToken}`,
    Cookie: cookieParts.join("; "),
  };
}
