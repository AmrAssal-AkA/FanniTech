import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  SESSION_USER_COOKIE,
  refreshBackendSession,
} from "@/services/session.service";
import {
  decodeJwtPayload,
  isJwtExpired,
  verifyJwtSignature,
} from "@/utils/jwt";
import type { SessionUser } from "@/types/session";

function readSessionUser(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as SessionUser;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const secret = process.env.ACCESS_TOKEN_SECRET;
  let payload = accessToken ? decodeJwtPayload(accessToken) : null;
  let refreshed = false;
  let refreshedTokens: Awaited<
    ReturnType<typeof refreshBackendSession>
  > | null = null;

  if (
    accessToken &&
    payload &&
    !isJwtExpired(payload) &&
    secret &&
    !(await verifyJwtSignature(accessToken, secret))
  ) {
    accessToken = undefined;
    payload = null;
  }

  if ((!accessToken || !payload || isJwtExpired(payload)) && refreshToken) {
    try {
      refreshedTokens = await refreshBackendSession(refreshToken);
      accessToken = refreshedTokens.accessToken;
      payload = decodeJwtPayload(accessToken);
      refreshed = true;
    } catch {
      accessToken = undefined;
      payload = null;
    }
  }

  const role = String(payload?.role || "").toUpperCase();
  if (
    !accessToken ||
    !payload ||
    !payload.sub ||
    !["ADMIN", "TECHNICIAN"].includes(role)
  ) {
    return NextResponse.json(
      { user: null, isAuthenticated: false } satisfies {
        user: null;
        isAuthenticated: false;
      },
      { status: 200 },
    );
  }

  const user = readSessionUser(cookieStore.get(SESSION_USER_COOKIE)?.value);
  const response = NextResponse.json({
    user: user
      ? { ...user, id: payload.sub, role }
      : { id: payload.sub, name: "Staff member", email: "", role },
    isAuthenticated: true,
  });
  if (refreshed && refreshedTokens) {
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: refreshedTokens.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: refreshedTokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
  return response;
}
