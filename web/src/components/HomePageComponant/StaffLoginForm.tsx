"use client";

import { useState } from "react";
import {
  Shield,
  Wrench,
  BadgeCheck,
  Cpu,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  MailCheck,
  Scale,
  Radio,
  Loader2,
  PackageCheck,
  TerminalSquare,
  CheckCircle2,
} from "lucide-react";
import { authenticateStaff } from "@/services/auth.service";
import type { LoginResponse } from "@/types/auth";

type RoleType = "admin" | "tech";

interface DemoProfile {
  name: string;
  role: RoleType;
  roleLabel: string;
  email: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    name: "T. Al-Mansoor",
    role: "admin",
    roleLabel: "Owner / Admin",
    email: "tariq@fannitech.lab",
  },
  {
    name: "Ahmed Zaki",
    role: "tech",
    roleLabel: "Lead Bench Tech",
    email: "ahmed.z@fannitech.lab",
  },
  {
    name: "Sarah Al-Otaibi",
    role: "tech",
    roleLabel: "System Specialist",
    email: "sarah.o@fannitech.lab",
  },
];

export function StaffLoginForm() {
  const [role, setRole] = useState<RoleType>("admin");
  const [identifier, setIdentifier] = useState("tariq@fannitech.lab");
  const [passphrase, setPassphrase] = useState("secretbench2024");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<LoginResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    setErrorMessage(null);
    if (newRole === "admin") {
      if (identifier.includes("TECH-") || identifier === "ahmed.z@fannitech.lab" || identifier === "sarah.o@fannitech.lab") {
        setIdentifier("tariq@fannitech.lab");
      }
    } else {
      if (identifier === "tariq@fannitech.lab") {
        setIdentifier("TECH-402");
      }
    }
  };

  const handlePrefill = (profile: DemoProfile) => {
    setRole(profile.role);
    setIdentifier(profile.email);
    setPassphrase("secretbench2024");
    setErrorMessage(null);
    triggerToast(`Loaded pre-filled credentials for ${profile.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authenticateStaff({
        identifier,
        passphrase,
        role,
        rememberWorkstation,
      });

      setAuthSuccess(response);
      triggerToast(`Welcome back, ${response.user.name}. Directing to Lab Workbench...`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Check credentials.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl flex flex-col items-center">
      {/* Ambient backdrop glow */}
      <div className="absolute -top-16 -left-12 w-64 h-64 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-12 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_20px_45px_-15px_rgba(11,28,48,0.08)] dark:shadow-none rounded-2xl overflow-hidden relative transition-all duration-300">
        {/* Top Diagnostic Telemetry Strip */}
        <div className="bg-sky-50/70 dark:bg-zinc-900/90 border-b border-sky-100/80 dark:border-zinc-800 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-zinc-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-sky-600 dark:bg-sky-400 animate-ping" />
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              SEC-AUTH://V1.04
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>STATION-ID: #DX-902</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
            <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>LATENCY: 4ms</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Header & Bilingual Identity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Staff Authentication
              </h1>
              <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                Restricted Access
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to initialize diagnostic telemetry, bench inventory, and tickets.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex flex-col gap-2">
            <div className="bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/60 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  role === "admin"
                    ? "bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Owner / Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("tech")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  role === "tech"
                    ? "bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Technician</span>
              </button>
            </div>

            {/* Dynamic Clearance Banner */}
            <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800 px-3.5 py-2 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {role === "admin" ? (
                  <BadgeCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                ) : (
                  <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                )}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {role === "admin"
                    ? "Full Operations Clearance"
                    : "Bench & Diagnostics Station"}
                </span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {role === "admin" ? "TIER-0 LAB ROOT" : "WORKBENCH_ACCESS_ONLY"}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Staff Identifier */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="staff-identifier"
                className="text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
              >
                <span>Staff Email or Tech ID</span>
                <span className="text-[10px] font-mono text-zinc-400">AUTH_UID</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="staff-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    role === "admin"
                      ? "admin@fannitech.lab or email"
                      : "TECH-402 or technician email"
                  }
                  className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="staff-password"
                  className="text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Access Key / Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    triggerToast(`Password recovery link dispatched to ${identifier}`)
                  }
                  className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter workstation passphrase"
                  className="w-full h-11 pl-10 pr-10 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 transition-all"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Workstation Checkbox */}
            <div className="py-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberWorkstation}
                  onChange={(e) => setRememberWorkstation(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-0 accent-sky-600 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    Remember this workstation
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Enables 8-hour cached auth token for shared benches
                  </span>
                </div>
              </label>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs p-3 rounded-lg flex items-center gap-2">
                <span className="font-semibold">Authentication Error:</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Feedback */}
            {authSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Authenticated as <strong>{authSuccess.user.name}</strong> ({authSuccess.user.role})
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                  {authSuccess.stationId}
                </span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-sky-700 hover:bg-sky-800 active:scale-[0.99] text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Station...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>
                    {role === "admin"
                      ? "Sign In to Lab OS"
                      : "Connect to Workbench Queue"}
                  </span>
                  <kbd className="hidden sm:inline-block bg-sky-800/80 text-sky-100 px-1.5 py-0.5 rounded text-[10px] font-mono ml-1">
                    ↵ ENTER
                  </kbd>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Profiles */}
          <div className="flex flex-col gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Quick Demo Profiles
              </span>
              <span className="text-[10px] font-mono text-zinc-400">TAP TO PREFILL</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_PROFILES.map((profile) => (
                <button
                  key={profile.email}
                  type="button"
                  onClick={() => handlePrefill(profile)}
                  className="flex flex-col items-start p-2.5 bg-zinc-50 hover:bg-sky-50/60 dark:bg-zinc-950 dark:hover:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 rounded-lg text-left transition-all"
                >
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate w-full">
                    {profile.name}
                  </span>
                  <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">
                    {profile.roleLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Staff Activation Callout */}
          <div className="bg-sky-50/50 dark:bg-zinc-950 border border-sky-100 dark:border-zinc-800 p-3 rounded-lg flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span>New technician or bench engineer?</span>
            </div>
            <button
              type="button"
              onClick={() =>
                triggerToast("Redirecting to Lab OS Invitation Token validator...")
              }
              className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
            >
              Activate Invite
            </button>
          </div>
        </div>

        {/* Station Node Security Footer */}
        <div className="bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200/70 dark:border-zinc-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              Workstation logins audited on{" "}
              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                Node 192.168.1.14
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
              Lab Systems Online (98.4%)
            </span>
          </div>
        </div>
      </div>

      {/* Active Hardware Diagnostic Anchors */}
      <div className="w-full max-w-xl mt-4 grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 rounded-xl shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              14 Devices
            </span>
            <span className="text-[10px] text-zinc-500 truncate">Active on Bench</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 rounded-xl shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              6 Dispatched
            </span>
            <span className="text-[10px] text-zinc-500 truncate">Parts in Transit</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 rounded-xl shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0">
            <TerminalSquare className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              v1.0.4 Rev
            </span>
            <span className="text-[10px] text-zinc-500 truncate">Lab OS Core</span>
          </div>
        </div>
      </div>

      {/* Floating Alert Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <KeyRound className="w-4 h-4 text-sky-400 dark:text-sky-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
