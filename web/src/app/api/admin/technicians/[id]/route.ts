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

async function getAuthTokens() {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get("accessToken")?.value ||
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken =
    cookieStore.get("refreshToken")?.value ||
    cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  return { accessToken, refreshToken };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing technician ID parameter" },
      { status: 400 }
    );
  }

  const { accessToken: initialToken, refreshToken } = await getAuthTokens();
  let accessToken = initialToken;

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

  try {
    const fetchFromBackend = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.get(`/api/v1/admin/technicians/${id}`, {
        headers: getAuthHeaders(token, activeRefreshToken),
      });
    };

    let result;
    try {
      result = await fetchFromBackend(accessToken!, refreshToken);
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
      } else {
        throw err;
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        data: result.data,
        technician: result.data,
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
    console.error(`Error fetching technician ${id}:`, error);
    const status = (axios.isAxiosError(error) && error.response?.status) || 500;
    const message =
      (axios.isAxiosError(error) &&
        typeof error.response?.data?.message === "string" &&
        error.response.data.message) ||
      `Failed to fetch technician ${id}.`;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing technician ID parameter" },
      { status: 400 }
    );
  }

  const { accessToken: initialToken, refreshToken } = await getAuthTokens();
  let accessToken = initialToken;

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
    const patchBackend = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.patch(`/api/v1/admin/technicians/${id}`, body, {
        headers: getAuthHeaders(token, activeRefreshToken),
      });
    };

    let result;
    try {
      result = await patchBackend(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await patchBackend(accessToken, refreshed.refreshToken);
      } else {
        throw err;
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Technician updated successfully.",
        data: result.data,
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
    console.error(`Error updating technician ${id}:`, error);
    const status = (axios.isAxiosError(error) && error.response?.status) || 500;
    const message =
      (axios.isAxiosError(error) &&
        typeof error.response?.data?.message === "string" &&
        error.response.data.message) ||
      (axios.isAxiosError(error) &&
        Array.isArray(error.response?.data?.message) &&
        error.response.data.message.join(", ")) ||
      `Failed to update technician ${id}.`;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing technician ID parameter" },
      { status: 400 }
    );
  }

  const { accessToken: initialToken, refreshToken } = await getAuthTokens();
  let accessToken = initialToken;

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

  try {
    const deleteFromBackend = async (token: string, currentRefreshToken?: string) => {
      const activeRefreshToken = currentRefreshToken || refreshToken;
      return serverClient.delete(`/api/v1/admin/technicians/${id}`, {
        headers: getAuthHeaders(token, activeRefreshToken),
      });
    };

    let result;
    try {
      result = await deleteFromBackend(accessToken!, refreshToken);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401 &&
        refreshToken &&
        !refreshed
      ) {
        refreshed = await refreshBackendSession(refreshToken);
        accessToken = refreshed.accessToken;
        result = await deleteFromBackend(accessToken, refreshed.refreshToken);
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
            : "Technician deleted successfully.",
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
    console.error(`Error deleting technician ${id}:`, error);
    const status = (axios.isAxiosError(error) && error.response?.status) || 500;
    const message =
      (axios.isAxiosError(error) &&
        typeof error.response?.data?.message === "string" &&
        error.response.data.message) ||
      `Failed to delete technician ${id}.`;
    return NextResponse.json({ success: false, message }, { status });
  }
}

