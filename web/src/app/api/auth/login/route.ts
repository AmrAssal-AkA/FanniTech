import { NextResponse } from "next/server";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body: LoginCredentials = await request.json();

    if (!body.identifier || !body.passphrase) {
      return NextResponse.json(
        { message: "Staff identifier and access key are required" },
        { status: 400 }
      );
    }

    // Determine role details based on request
    const role = body.role || (body.identifier.includes("TECH-") ? "tech" : "admin");
    const name =
      role === "admin"
        ? "Tariq Al-Mansoor"
        : body.identifier.includes("sarah")
        ? "Sarah Al-Otaibi"
        : "Ahmed Zaki";

    const response: LoginResponse = {
      user: {
        id: role === "admin" ? "usr_adm_01" : "usr_tch_402",
        email: body.identifier.includes("@") ? body.identifier : `${body.identifier.toLowerCase()}@fannitech.lab`,
        name,
        role,
        branch: "Branch #01 - Main Lab",
      },
      token: `fanni_sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
      stationId: "#DX-902",
      node: "192.168.1.14",
      expiresIn: body.rememberWorkstation ? 28800 : 3600, // 8 hours or 1 hour
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { message: "Authentication service encountered an error" },
      { status: 500 }
    );
  }
}
