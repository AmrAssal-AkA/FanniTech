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
import type {
  AdminDashboardData,
  RepairRequestItem,
  ActiveTicketItem,
} from "@/types/dashboard";
import type { BackendRepairRequest } from "@/types/requests";
import type { ListTicketsResponse, RepairTicket } from "@/types/tickets";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET() {
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
    const fetchDashboardEntities = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      const headers = getAuthHeaders(token, activeRefreshToken);
      const [pendingReqsRes, ticketsRes] = await Promise.all([
        serverClient
          .get<{
            items: BackendRepairRequest[];
            pagination: { total: number };
          }>("/api/v1/repair-request-management/requests", {
            params: { status: "PENDING", limit: 10 },
            headers,
          })
          .catch(() => ({ data: { items: [], pagination: { total: 0 } } })),
        serverClient
          .get<ListTicketsResponse>("/api/v1/repair-request-management/tickets", {
            params: { limit: 50 },
            headers,
          })
          .catch(() => ({ data: { items: [], pagination: { total: 0 } } })),
      ]);
      return {
        pendingData: pendingReqsRes.data,
        ticketsData: ticketsRes.data,
      };
    };

    let result;
    try {
      result = await fetchDashboardEntities(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await fetchDashboardEntities(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const { pendingData, ticketsData } = result;
    const allTickets: RepairTicket[] = ticketsData.items || [];
    const pendingReqs: BackendRepairRequest[] = pendingData.items || [];

    const inDiagnosis = allTickets.filter((t) => t.status === "DIAGNOSING").length;
    const inRepair = allTickets.filter((t) => t.status === "IN_REPAIR").length;
    const readyPickup = allTickets.filter((t) => t.status === "READY_FOR_PICKUP").length;
    const completed = allTickets.filter((t) => t.status === "COMPLETED").length;
    const activeTotal = inDiagnosis + inRepair + readyPickup;

    const mappedPendingRequests: RepairRequestItem[] = pendingReqs.map((r) => {
      const probLower = (r.problem || "").toLowerCase();
      let category: "power" | "liquid" | "thermal" | "battery" | "screen" | "other" = "power";
      if (probLower.includes("liquid")) category = "liquid";
      else if (probLower.includes("thermal")) category = "thermal";
      else if (probLower.includes("battery")) category = "battery";
      else if (probLower.includes("screen")) category = "screen";
      else category = "other";

      const createdDate = new Date(r.createdAt);
      const timeAgo = `${Math.max(
        1,
        Math.floor((Date.now() - createdDate.getTime()) / 60000)
      )} mins ago`;

      const requestStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "CONVERTED" =
        r.status === "PENDING"
          ? "PENDING"
          : r.status === "ACCEPTED"
            ? "ACCEPTED"
            : "REJECTED";

      return {
        id: r.id,
        customerName: r.device?.customer?.user?.name || "Client",
        deviceModel: `${r.device?.brand || ""} ${r.device?.model || ""}`.trim(),
        hardwareProblem: r.description || r.problem,
        problemCategory: category,
        status: requestStatus,
        createdAt: timeAgo,
      };
    });

    const mappedActiveTickets: ActiveTicketItem[] = allTickets.slice(0, 10).map((t) => {
      const priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL" =
        t.priority === "HIGH" ? "HIGH" : t.priority === "LOW" ? "LOW" : "NORMAL";

      let statusVal: "PENDING_ASSIGNMENT" | "DIAGNOSING" | "IN_REPAIR" | "WAITING_FOR_PARTS" | "READY_FOR_PICKUP" | "COMPLETED" | "CANCELLED" =
        "DIAGNOSING";
      if (t.status === "ACCEPTED") statusVal = "PENDING_ASSIGNMENT";
      else if (t.status === "DIAGNOSING") statusVal = "DIAGNOSING";
      else if (t.status === "IN_REPAIR") statusVal = "IN_REPAIR";
      else if (t.status === "READY_FOR_PICKUP") statusVal = "READY_FOR_PICKUP";
      else if (t.status === "COMPLETED") statusVal = "COMPLETED";
      else if (t.status === "CANCELLED" || t.status === "UNREPAIRABLE") statusVal = "CANCELLED";

      return {
        id: t.ticketNumber || t.id,
        deviceModel: `${t.request?.device?.brand || ""} ${t.request?.device?.model || ""}`.trim(),
        customerName: t.request?.device?.customer?.user?.name || "Customer",
        priority,
        slaDue: "Standard SLA",
        assignedTechName: t.technician?.user?.name || "Unassigned",
        assignedTechRole: "Hardware Specialist",
        status: statusVal,
        currentStageNote: t.repairNotes || t.diagnosis || "Active stage",
      };
    });

    const recentActivities = allTickets.slice(0, 5).map((t, idx) => ({
      id: `act-${t.id || idx}`,
      referenceId: t.ticketNumber || t.id,
      timestamp: new Date(t.updatedAt || t.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      actionText: `Ticket ${t.ticketNumber} transitioned to ${t.status}`,
      actorName: t.technician?.user?.name || "Bench Admin",
      detailNote: t.repairNotes || t.diagnosis || undefined,
      highlightType: (t.status === "COMPLETED"
        ? "secondary"
        : t.status === "UNREPAIRABLE"
          ? "error"
          : "primary") as "primary" | "tertiary" | "secondary" | "error",
      badgeInfo: t.status,
    }));

    const dashboardData: AdminDashboardData = {
      metrics: {
        pendingRequestsCount: pendingData.pagination?.total || pendingReqs.length,
        activeTicketsCount: activeTotal || allTickets.length,
        inDiagnosisCount: inDiagnosis,
        inRepairCount: inRepair,
        readyForPickupCount: readyPickup,
        completedTodayCount: completed,
        labBenchCapacity: {
          assigned: Math.min(10, activeTotal),
          total: 10,
          percentage: Math.min(100, Math.round((activeTotal / 10) * 100)),
        },
        slaRate: "98.4%",
      },
      pendingRequests: mappedPendingRequests,
      activeTickets: mappedActiveTickets,
      technicians: [],
      recentActivities,
    };

    const response = NextResponse.json(dashboardData);

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
    const message =
      axios.isAxiosError(error) &&
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "Failed to fetch admin dashboard";
    const status =
      axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
