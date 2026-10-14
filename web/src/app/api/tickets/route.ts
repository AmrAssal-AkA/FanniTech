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
import type { ListTicketsResponse } from "@/types/tickets";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(request: NextRequest) {
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

  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "50";
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const technicianId = searchParams.get("technicianId");
  const assignedToMe = searchParams.get("assignedToMe");

  const queryParams: Record<string, string | boolean> = { page, limit };
  if (status && status !== "ALL") queryParams.status = status;
  if (priority && priority !== "ALL") queryParams.priority = priority;
  if (technicianId) queryParams.technicianId = technicianId;
  if (assignedToMe === "true") queryParams.assignedToMe = true;

  try {
    const fetchTickets = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.get<ListTicketsResponse>(
        "/api/v1/repair-request-management/tickets",
        {
          params: queryParams,
          headers: getAuthHeaders(token, activeRefreshToken),
        }
      );
    };

    let result;
    try {
      result = await fetchTickets(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await fetchTickets(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const response = NextResponse.json({
      success: true,
      items: result.data.items,
      pagination: result.data.pagination,
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
        : "Failed to fetch repair tickets";
    const status =
      axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

