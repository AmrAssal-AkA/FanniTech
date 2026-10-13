import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
} from "@/services/session.service";

import {serverClient} from "@/lib/serverClient";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    try {
      await serverClient.post("/api/v1/auth/logout", {
        refreshToken,
      });
    } catch {
      // Local session cleanup must still happen if the backend is unavailable.
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: SESSION_USER_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
