"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "@/Hooks/useAuth";
import type { User } from "@/types/auth";

export function StaffLoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, loading, isAdmin, isTechnician } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [redirectDestination, setRedirectDestination] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isAdmin) {
        router.replace(redirectDestination || "/dashboard");
      } else if (isTechnician) {
        router.replace(redirectDestination || "/technician/dashboard");
      }
    }
  }, [loading, isAuthenticated, isAdmin, isTechnician, router, redirectDestination]);

  // Check URL parameters for redirection or middleware errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      const redirectParam = params.get("redirect");

      if (redirectParam) {
        setRedirectDestination(redirectParam);
      }

      if (errorParam === "unauthorized") {
        setErrorMessage("Access Denied: Administrative or technician privileges required.");
      } else if (errorParam === "session_expired") {
        setErrorMessage("Your session has expired. Please sign in again.");
      } else if (errorParam === "missing_token") {
        setErrorMessage("Authentication required. Please sign in to access the portal.");
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await login({
        email: identifier,
        password: passphrase,
        rememberWorkstation,
      });

      setAuthSuccess(user);
      const roleNormalized = (user.role || "").toUpperCase();

      if (roleNormalized === "ADMIN") {
        triggerToast(`Welcome back, ${user.name}. Directing to Admin Dashboard...`);
        setTimeout(() => {
          router.push(redirectDestination || "/dashboard");
          router.refresh();
        }, 700);
      } else if (roleNormalized === "TECHNICIAN") {
        triggerToast(`Welcome back, ${user.name}. Directing to Technician Workbench...`);
        setTimeout(() => {
          router.push(redirectDestination || "/technician/dashboard");
          router.refresh();
        }, 700);
      } else {
        triggerToast(`Welcome, ${user.name}. Portal session initialized.`);
      }
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Staff Identifier */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="staff-identifier"
                className="text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
              >
                <span>Staff Email Address</span>
                <span className="text-[10px] font-mono text-zinc-400">AUTH_EMAIL</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="staff-identifier"
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="example@fannitech.com"
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
                    Enables extended cached session token for bench stations
                  </span>
                </div>
              </label>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs p-3 rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <div>
                  <span className="font-semibold mr-1">Authentication Notice:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Success Feedback */}
            {authSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Authenticated as <strong>{authSuccess.name}</strong> ({authSuccess.role})
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                  {authSuccess.email}
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
                  <span>Sign In to Lab OS</span>
                  <kbd className="hidden sm:inline-block bg-sky-800/80 text-sky-100 px-1.5 py-0.5 rounded text-[10px] font-mono ml-1">
                    ↵ ENTER
                  </kbd>
                </>
              )}
            </button>
          </form>
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
