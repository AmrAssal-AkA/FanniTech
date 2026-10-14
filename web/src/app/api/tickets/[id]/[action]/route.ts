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

const VALID_ACTIONS = [
  "assign",
  "diagnose",
  "repair",
  "ready-for-pickup",
  "complete",
  "unrepairable",
  "cancel",
] as const;

type ActionType = (typeof VALID_ACTIONS)[number];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await context.params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ticket id" },
      { status: 400 }
    );
  }

  if (!VALID_ACTIONS.includes(action as ActionType)) {
    return NextResponse.json(
      {
        success: false,
        message: `Invalid action '${action}'. Valid actions are: ${VALID_ACTIONS.join(", ")}`,
      },
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
    let endpoint = "";
    let payload: Record<string, unknown> = {};

    switch (action as ActionType) {
      case "assign":
        endpoint = `/api/v1/repair-request-management/tickets/${id}/assign-technician`;
        if (!rawBody.technicianId || typeof rawBody.technicianId !== "string") {
          return NextResponse.json(
            { success: false, message: "technicianId is required" },
            { status: 400 }
          );
        }
        payload = { technicianId: rawBody.technicianId };
        break;

      case "diagnose":
        endpoint = `/api/v1/repair-request-management/tickets/${id}/diagnose`;
        payload = { notes: rawBody.notes || undefined };
        break;

      case "repair":
        endpoint = `/api/v1/repair-request-management/tickets/${id}/repair`;
        if (
          !rawBody.diagnosis ||
          typeof rawBody.diagnosis !== "string" ||
          rawBody.diagnosis.trim().length < 5
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Diagnosis findings are required (min 5 characters)",
            },
            { status: 400 }
          );
        }
        payload = {
          diagnosis: rawBody.diagnosis.trim(),
          notes: rawBody.notes || undefined,
        };
        break;

      case "ready-for-pickup":
        endpoint = `/api/v1/repair-request-management/tickets/${id}/ready-for-pickup`;
        if (
          !rawBody.repairNotes ||
          typeof rawBody.repairNotes !== "string" ||
          rawBody.repairNotes.trim().length < 5
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Repair notes are required (min 5 characters)",
            },
            { status: 400 }
          );
        }
        payload = {
          repairNotes: rawBody.repairNotes.trim(),
          notes: rawBody.notes || undefined,
        };
        break;

      case "complete":
        endpoint = `/api/v1/repair-request-management/tickets/${id}/complete`;
        payload = { notes: rawBody.notes || undefined };
        break;

      case "unrepairable":
        endpoint = `/api/v1/repair-request-management/tickets/${id}/unrepairable`;
        if (
          !rawBody.reason ||
          typeof rawBody.reason !== "string" ||
          rawBody.reason.trim().length < 5
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Unrepairable reason is required (min 5 characters)",
            },
            { status: 400 }
          );
        }
        payload = {
          reason: rawBody.reason.trim(),
          notes: rawBody.notes || undefined,
        };
        break;

      case "cancel":
        endpoint = `/api/v1/repair-request-management/tickets/${id}/cancel`;
        payload = { notes: rawBody.notes || undefined };
        break;
    }

    const sendAction = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.patch(endpoint, payload, {
        headers: getAuthHeaders(token, activeRefreshToken),
      });
    };

    let result;
    try {
      result = await sendAction(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await sendAction(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const response = NextResponse.json({
      success: true,
      action,
      data: result.data,
      ticket: result.data,
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
        : `Failed to execute action ${action} on ticket ${id}`;
    const status =
      axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

