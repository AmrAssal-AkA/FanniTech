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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing request id parameter" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let refreshed: TokenPair | null = null;
  if (!accessToken && refreshToken) {
    try {
      refreshed = await refreshBackendSession(refreshToken);
      accessToken = refreshed.accessToken;
    } catch {
      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );
    }
  }

  try {
    const rawBody = await request.json().catch(() => ({}));
    const reason = typeof rawBody.reason === "string" ? rawBody.reason.trim() : "";

    if (!reason || reason.length < 5) {
      return NextResponse.json(
        { success: false, message: "Rejection reason must be at least 5 characters long" },
        { status: 400 }
      );
    }

    const sendReject = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.patch(
        `/api/v1/repair-request-management/requests/${id}/reject`,
        { reason },
        { headers: getAuthHeaders(token, activeRefreshToken) }
      );
    };

    let result;
    try {
      result = await sendReject(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await sendReject(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const response = NextResponse.json({
      success: true,
      message: `Request ${id} rejected`,
      data: result.data,
    });

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
    const rawMessage =
      axios.isAxiosError(error) && error.response?.data?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : typeof rawMessage === "string"
        ? rawMessage
        : "Failed to reject repair request";
    const status =
      axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

