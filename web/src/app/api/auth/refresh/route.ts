import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverClient } from "@/lib/serverClient";
import type { LoginResponse } from "@/types/auth";

export async function POST() {
  const refreshToken = (await cookies()).get("x-refresh-token")?.value;
  if (!refreshToken) return NextResponse.json({ success: false, message: "No refresh token found" }, { status: 401 });

  try {
    const { data } = await serverClient.post<LoginResponse>("/api/v1/auth/refresh", { refreshToken, service: "web" });
    const response = NextResponse.json({ success: true });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
    response.cookies.set("x-access-token", data.accessToken, { ...options, maxAge: 15 * 60 });
    response.cookies.set("x-refresh-token", data.refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 });
    return response;
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) && error.response?.status === 401 ? 401 : 500;
    return NextResponse.json({ success: false, message: "Session refresh failed" }, { status });
  }
}
