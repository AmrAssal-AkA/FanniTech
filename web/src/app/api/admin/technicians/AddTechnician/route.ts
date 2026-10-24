import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { serverClient } from "@/lib/serverClient";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  refreshBackendSession,
  getAuthHeaders,
  type TokenPair,
} from "@/services/session.service";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{8,15}$/;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  let accessToken =
    cookieStore.get("accessToken")?.value ||
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken =
    cookieStore.get("refreshToken")?.value ||
    cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in as an administrator." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON request payload." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone =
    typeof body.phone === "string" && body.phone.trim().length > 0
      ? body.phone.trim()
      : undefined;
  const role = "TECHNICIAN";

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Technician name is required." },
      { status: 400 }
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, message: "A valid staff email address is required." },
      { status: 400 }
    );
  }

  if (!password || password.length < 6) {
    return NextResponse.json(
      { success: false, message: "Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

  if (phone && !PHONE_REGEX.test(phone)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid phone number format. Must contain 8 to 15 digits (e.g. +966501234567).",
      },
      { status: 400 }
    );
  }

  const payload = {
    name,
    email,
    password,
    ...(phone ? { phone } : {}),
    role,
  };

  let refreshed: TokenPair | null = null;
  if (!accessToken && refreshToken) {
    try {
      refreshed = await refreshBackendSession(refreshToken);
      accessToken = refreshed.accessToken;
    } catch {
      return NextResponse.json(
        { success: false, message: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
  }

  try {
    const postToBackend = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.post(
        "/api/v1/admin/technicians/create-technician",
        payload,
        { headers: getAuthHeaders(token, activeRefreshToken) }
      );
    };

    let result;
    try {
      result = await postToBackend(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await postToBackend(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Technician account created successfully.",
        data: result.data,
      },
      { status: 201 }
    );

    if (refreshed) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }

    return response;
  } catch (error: unknown) {
    console.error("Error creating technician:", error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : Array.isArray(error.response?.data?.message)
          ? error.response.data.message.join(", ")
          : "Failed to create technician account.";
      return NextResponse.json({ success: false, message }, { status });
    }

    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}