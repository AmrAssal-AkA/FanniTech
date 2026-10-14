import { NextResponse } from "next/server";
import { cookies } from "next/headers";


import {serverClient} from "@/lib/serverClient";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('x-refresh-token')?.value;
  if (refreshToken) {
    try {
      await serverClient.post("/api/v1/auth/logout", {
        refreshToken,
      });
    } catch {
      // Local session cleanup must still happen if the backend is unavailable.
    }
  }

  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  res.cookies.delete({ name: "x-access-token", path: "/" });
  res.cookies.delete({ name: "x-refresh-token", path: "/" });
  return res;
}
