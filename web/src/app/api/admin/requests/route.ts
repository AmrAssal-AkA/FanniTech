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
import {
  adaptBackendRequestToDetailed,
  type BackendRepairRequest,
  type DetailedRepairRequest,
  type RequestsSummaryMetrics,
  type TechnicianOption,
} from "@/types/requests";

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
      { success: false, message: "Unauthorized: Missing session token" },
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

  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "50";
  const statusParam = searchParams.get("status");
  const searchQuery = (searchParams.get("q") || "").toLowerCase().trim();

  const queryParams: Record<string, string> = { page, limit };
  if (statusParam && statusParam !== "ALL") {
    queryParams.status = statusParam;
  }

  try {
    const makeCalls = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      const headers = getAuthHeaders(token, activeRefreshToken);
      const [reqResponse, techResponse] = await Promise.all([
        serverClient.get<{
          items: BackendRepairRequest[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>("/api/v1/repair-request-management/requests", {
          params: queryParams,
          headers,
        }),
        serverClient
          .get<TechnicianOption[]>("/api/v1/repair-request-management/technicians", {
            headers,
          })
          .catch(() => ({ data: [] as TechnicianOption[] })),
      ]);
      return { reqData: reqResponse.data, techData: techResponse.data };
    };

    let resultData;
    try {
      resultData = await makeCalls(accessToken!, refreshToken);
    } catch (err: unknown) {
      console.error("Error fetching repair requests:", err);
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        resultData = await makeCalls(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const { reqData, techData } = resultData;
    let adaptedRequests: DetailedRepairRequest[] = (reqData.items || []).map(
      adaptBackendRequestToDetailed
    );

    if (searchQuery) {
      adaptedRequests = adaptedRequests.filter(
        (r) =>
          r.id.toLowerCase().includes(searchQuery) ||
          r.customer.name.toLowerCase().includes(searchQuery) ||
          r.hardware.model.toLowerCase().includes(searchQuery) ||
          r.problemTitle.toLowerCase().includes(searchQuery)
      );
    }

    const pendingCount = adaptedRequests.filter((r) => r.status === "PENDING").length;
    const acceptedCount = adaptedRequests.filter((r) => r.status === "ACCEPTED").length;
    const rejectedCount = adaptedRequests.filter((r) => r.status === "REJECTED").length;
    const cancelledCount = adaptedRequests.filter((r) => r.status === "CANCELLED").length;

    const metrics: RequestsSummaryMetrics = {
      totalCount: reqData.pagination?.total ?? adaptedRequests.length,
      pendingCount,
      acceptedCount,
      rejectedCount,
      cancelledCount,
      avgResponseTime: "12 mins",
      appVersion: "Live Cloud Sync",
    };

    const response = NextResponse.json({
      success: true,
      requests: adaptedRequests,
      items: adaptedRequests,
      metrics,
      technicians: techData,
      pagination: reqData.pagination,
    });

    if (refreshed) {
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        refreshed.accessToken,
        { ...cookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE }
      );
      response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        refreshed.refreshToken,
        { ...cookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE }
      );
    }

    return response;
  } catch (error: unknown) {
    const message =
      axios.isAxiosError(error) &&
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "Failed to fetch repair requests from server";
    const status =
      axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
