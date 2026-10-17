import { NextRequest, NextResponse } from "next/server";
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handleResetPassword(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing technician ID parameter" },
      { status: 400 }
    );
  }

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
      { success: false, message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password || password.length < 6) {
    return NextResponse.json(
      { success: false, message: "Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

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
    const postReset = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.patch(
        `/api/v1/admin/technicians/${id}/reset-password`,
        { password },
        { headers: getAuthHeaders(token, activeRefreshToken) }
      );
    };

    let result;
    try {
      result = await postReset(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await postReset(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message:
          typeof result.data?.message === "string"
            ? result.data.message
            : "Technician password reset successfully.",
      },
      { status: 200 }
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
    console.error(`Error resetting password for technician ${id}:`, error);
    const status = (axios.isAxiosError(error) && error.response?.status) || 500;
    const message =
      (axios.isAxiosError(error) &&
        typeof error.response?.data?.message === "string" &&
        error.response.data.message) ||
      `Failed to reset technician password.`;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleResetPassword(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleResetPassword(request, context);
}

