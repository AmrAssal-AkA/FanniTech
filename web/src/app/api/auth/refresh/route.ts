import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  SESSION_USER_COOKIE,
  refreshBackendSession,
} from "@/services/session.service";

import { serverClient } from "@/lib/serverClient";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken)
    return NextResponse.json(
      { message: "Refresh token missing" },
      { status: 401 },
    );

  try {
    const res = await serverClient.post("/api/v1/auth/web/refresh", {
      refreshToken,
    });

    const tokens = res.data;

    if (
      !tokens ||
      !tokens.accessToken ||
      !tokens.refreshToken ||
      !tokens.user
    ) {
      return NextResponse.json(
        { message: "Invalid response from authentication backend" },
        { status: 500 },
      );
    }
    const response = NextResponse.json({
      success: true,
      expiresIn: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: tokens.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    if (tokens.user) {
      response.cookies.set({
        name: SESSION_USER_COOKIE,
        value: encodeURIComponent(JSON.stringify(tokens.user)),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }
    return response;
  } catch {
    return NextResponse.json(
      { message: "Session refresh failed" },
      { status: 401 },
    );
  }
}
