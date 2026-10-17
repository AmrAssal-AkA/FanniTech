import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  decodeJwtPayload,
  isJwtExpired,
  verifyJwtSignature,
} from "@/utils/jwt";
import {
  refreshBackendSession,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/services/session.service";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve JWT access token from HttpOnly cookies
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("error", "missing_token");
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify HMAC signature if secret is provided in environment
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (secret && !(await verifyJwtSignature(token, secret))) {
    if (refreshToken) return refreshAndContinue(request, refreshToken);
    return redirectToLogin(request, "unauthorized", pathname);
  }

  const payload = decodeJwtPayload(token);
  if (!payload) return redirectToLogin(request, "unauthorized", pathname);

  if (isJwtExpired(payload)) {
    if (refreshToken) return refreshAndContinue(request, refreshToken);
    return redirectToLogin(request, "session_expired", pathname);
  }

  const role = String(payload.role || "").toUpperCase();

  // If a technician accesses /dashboard, direct them to their technician dashboard
  if (role === "TECHNICIAN" && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    return NextResponse.redirect(new URL("/technician/dashboard", request.url));
  }

  const isTechnicianRoute =
    pathname.startsWith("/technician") || pathname.startsWith("/bench");
  const isAdminRoute = !isTechnicianRoute;
  const allowed = isTechnicianRoute
    ? role === "ADMIN" || role === "TECHNICIAN"
    : isAdminRoute && role === "ADMIN";
  if (!allowed) return redirectToLogin(request, "unauthorized", pathname);

  return NextResponse.next();
}

function redirectToLogin(
  request: NextRequest,
  error: string,
  pathname: string,
) {
  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("error", error);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

async function refreshAndContinue(request: NextRequest, refreshToken: string) {
  try {
    const tokens = await refreshBackendSession(refreshToken);
    const payload = decodeJwtPayload(tokens.accessToken);
    const role = String(payload?.role || "").toUpperCase();
    const isTechnicianRoute =
      request.nextUrl.pathname.startsWith("/technician") ||
      request.nextUrl.pathname.startsWith("/bench");

    if (
      role === "TECHNICIAN" &&
      (request.nextUrl.pathname === "/dashboard" ||
        request.nextUrl.pathname.startsWith("/dashboard/"))
    ) {
      const redirectResponse = NextResponse.redirect(
        new URL("/technician/dashboard", request.url)
      );
      redirectResponse.cookies.set({
        name: ACCESS_TOKEN_COOKIE,
        value: tokens.accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      redirectResponse.cookies.set({
        name: REFRESH_TOKEN_COOKIE,
        value: tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
      return redirectResponse;
    }

    const allowed = isTechnicianRoute
      ? role === "ADMIN" || role === "TECHNICIAN"
      : role === "ADMIN";
    if (!payload || !allowed)
      return redirectToLogin(request, "unauthorized", request.nextUrl.pathname);

    const response = NextResponse.next();
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: tokens.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    return response;
  } catch {
    return redirectToLogin(
      request,
      "session_expired",
      request.nextUrl.pathname,
    );
  }
}

// Protect all routes belonging to the (admin) section
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/customers/:path*",
    "/repair-requests/:path*",
    "/repair-tickets/:path*",
    "/technicians/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/technician/:path*",
    "/technician",
    "/bench/:path*",
    "/bench",
  ],
};
