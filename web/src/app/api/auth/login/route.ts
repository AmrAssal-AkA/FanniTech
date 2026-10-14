import axios from "axios";
import { NextResponse } from "next/server";
import type { LoginCredentials, LoginResponse } from "@/types/auth";
import { serverClient } from "@/lib/serverClient";

const accessCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60,
};
const refreshCookie = { ...accessCookie, maxAge: 7 * 24 * 60 * 60 };

export async function POST(request: Request) {
  try {
    const credentials = (await request.json()) as LoginCredentials;
    const { data } = await serverClient.post<LoginResponse>(
      "/api/v1/auth/web/login",
      credentials,
    );
    const response = NextResponse.json({ success: true, data });
    response.cookies.set("x-access-token", data.accessToken, accessCookie);
    response.cookies.set("x-refresh-token", data.refreshToken, refreshCookie);
    return response;
  } catch (error: unknown) {
    const message =
      axios.isAxiosError(error) &&
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "Authentication failed";
    const status =
      axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
