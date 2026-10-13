import { NextResponse } from "next/server";
import type { LoginCredentials, LoginResponse } from "@/types/auth";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  SESSION_USER_COOKIE,
} from "@/services/session.service";
import { serverClient } from "@/lib/serverClient";

export async function POST(request: Request) {
  try {
    const body: LoginCredentials = await request.json();

    const email = (body.email || body.identifier || "").trim();
    const password = body.password || body.passphrase || "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Staff email/identifier and password are required" },
        { status: 400 },
      );
    }

    const res = await serverClient.post<LoginResponse>(
      "/api/v1/auth/web/login",
      {
        email,
        password,
        deviceInfo: body.deviceInfo,
        role: body.role,
        rememberWorkstation: body.rememberWorkstation,
      },
    );

    const data = res.data;

    if (!data || !data.accessToken || !data.refreshToken || !data.user) {
      return NextResponse.json(
        { message: "Invalid response from authentication backend" },
        { status: 500 },
      );
    }
    const response = NextResponse.json(data, { status: 200 });
    // Set secure HttpOnly cookies on the Next.js web application domain
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: data.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    response.cookies.set({
      name: SESSION_USER_COOKIE,
      value: encodeURIComponent(JSON.stringify(data.user)),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Internal server authentication error";
    return NextResponse.json(
      { message: `Failed to connect to authentication backend: ${message}` },
      { status: 500 },
    );
  }
}
