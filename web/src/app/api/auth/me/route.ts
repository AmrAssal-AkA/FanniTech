import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverClient } from "@/lib/serverClient";
import { getAuthHeaders } from "@/services/session.service";
import type { LoginResponse, User } from "@/types/auth";

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("x-access-token")?.value;
  const refreshToken = cookieStore.get("x-refresh-token")?.value;

  if (!accessToken && !refreshToken) return NextResponse.json({ success: false, data: null });

  try {
    let token = accessToken;
    let refreshed: LoginResponse | null = null;
    if (!token) {
      if (!refreshToken) throw new Error("Unauthenticated");
      const result = await serverClient.post<LoginResponse>("/api/v1/auth/refresh", { refreshToken, service: "web" });
      refreshed = result.data;
      token = refreshed.accessToken;
    }

    let data: User;
    try {
      ({ data } = await serverClient.get<User>("/api/v1/auth/me", { headers: getAuthHeaders(token!, refreshToken) }));
    } catch (error) {
      if (!refreshToken || !axios.isAxiosError(error) || error.response?.status !== 401) throw error;
      const result = await serverClient.post<LoginResponse>("/api/v1/auth/refresh", { refreshToken, service: "web" });
      refreshed = result.data;
      ({ data } = await serverClient.get<User>("/api/v1/auth/me", { headers: getAuthHeaders(refreshed.accessToken, refreshed.refreshToken) }));
    }
    const activeToken = refreshed?.accessToken ?? token ?? null;
    const response = NextResponse.json({
      success: true,
      data: { ...data, token: activeToken },
    });
    if (refreshed) {
      response.cookies.set("x-access-token", refreshed.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
      response.cookies.set("x-refresh-token", refreshed.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
    }
    return response;
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return NextResponse.json({ success: false, data: null, message: "Unauthenticated" }, { status: status === 401 ? 200 : 200 });
  }
}
