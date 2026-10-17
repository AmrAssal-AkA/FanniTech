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

export async function GET(request: Request) {
  const cookie = await cookies();
  let accessToken =
    cookie.get("accessToken")?.value || cookie.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken =
    cookie.get("refreshToken")?.value || cookie.get(REFRESH_TOKEN_COOKIE)?.value;

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

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";

  const params: Record<string, string> = { page, limit };
  if (search.trim()) {
    params.search = search.trim();
  }

  try {
    const fetchCustomersFromBackend = async (
      token: string,
      currentRefreshToken?: string
    ) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      const headers = getAuthHeaders(token, activeRefreshToken);

      return await serverClient.get("/api/v1/admin/customers", {
        params,
        headers,
        withCredentials: true,
      });
    };
    let res;
    try {
      res = await fetchCustomersFromBackend(accessToken!, refreshToken);
      console.log("Fetched customers from backend successfully");
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        res = await fetchCustomersFromBackend(accessToken, refreshed.refreshToken);
      } else {
        console.error("Error fetching customers from backend:", err);
        throw err;
      }
    }

    const data = res.data;
    if (!data) {
      return NextResponse.json(
        { success: false, message: "No data found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, data }, { status: 200 });

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
  } catch (error) {
    console.error("Error in GET /api/admin/customer/getCustomers:", error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : error.message || "Failed to fetch customers from server";
      return NextResponse.json({ success: false, message }, { status });
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}