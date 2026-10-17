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

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const search = searchParams.get("search");
  const hasPaginationOrSearch = Boolean(page || limit || search);

  const backendEndpoint = hasPaginationOrSearch
    ? `/api/v1/admin/technicians?${searchParams.toString()}`
    : "/api/v1/admin/technicians/getAllTechnicians";

  try {
    const fetchFromBackend = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.get(backendEndpoint, {
        headers: getAuthHeaders(token, activeRefreshToken),
      });
    };

    let result;
    try {
      result = await fetchFromBackend(accessToken!, refreshToken);
      console.log("Successfully fetched technicians from backend:", result.data);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await fetchFromBackend(accessToken, refreshed.refreshToken);
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Backend returns 404 when no technicians exist
        return NextResponse.json(
          {
            success: true,
            technicians: [],
            data: [],
            total: 0,
            message: "No technicians found",
          },
          { status: 200 }
        );
      } else {
        throw err;
      }
    }

    let rawData: unknown[] = [];
    let total = 0;
    let pageNum: number | undefined;
    let limitNum: number | undefined;

    if (Array.isArray(result.data)) {
      rawData = result.data;
      total = rawData.length;
    } else if (result.data && typeof result.data === "object") {
      const responseObj = result.data as Record<string, unknown>;
      if (Array.isArray(responseObj.data)) {
        rawData = responseObj.data;
      }
      total = typeof responseObj.total === "number" ? responseObj.total : rawData.length;
      pageNum = typeof responseObj.page === "number" ? responseObj.page : undefined;
      limitNum = typeof responseObj.limit === "number" ? responseObj.limit : undefined;
    }

    const response = NextResponse.json(
      {
        success: true,
        technicians: rawData,
        data: rawData,
        total,
        ...(pageNum ? { page: pageNum } : {}),
        ...(limitNum ? { limit: limitNum } : {}),
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
    console.error("Error fetching technicians in getListTechnician:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return NextResponse.json(
          {
            success: true,
            technicians: [],
            data: [],
            total: 0,
            message: "No technicians found",
          },
          { status: 200 }
        );
      }
      const status = error.response?.status || 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Failed to fetch technicians from server.";
      return NextResponse.json({ success: false, message }, { status });
    }

    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}