"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  LogIn,
  ShieldAlert,
  TicketCheck,
} from "lucide-react";
import { Header } from "@/components/Header&Footer/Header";
import { Footer } from "@/components/Header&Footer/Footer";
import { useAuth } from "@/Hooks/useAuth";
import { getRoleLabel } from "@/components/unAuthorizedComponent/_components/getRoleLabel";

export default function UnAuthorizedClientPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const [requestedPath, setRequestedPath] = useState("/dashboard");
  const roleLabel = getRoleLabel(role);
  const requestCode = useMemo(
    () => `AUTH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-403`,
    [],
  );

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    if (redirect) setRequestedPath(redirect);
  }, []);

  const goToLogin = () => {
    router.push(`/?redirect=${encodeURIComponent(requestedPath)}`);
  };

  const goToWorkspace = () => {
    router.push(role === "TECHNICIAN" ? "/technician" : "/dashboard");
  };

  const title = isAuthenticated
    ? "Access level mismatch"
    : "Authorization required";
  const description = isAuthenticated
    ? `Your ${roleLabel} session is active, but it does not include permission to open this workspace.`
    : "This workspace is restricted to verified FanniTech staff. Sign in with an authorized account to continue.";
    
  return (
    <>
      <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/5" />
      <div className="absolute -right-24 bottom-4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

      <div className="relative w-full max-w-2xl">
        <div className="mb-5 flex items-center justify-between px-1 text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400">
          <span>Secure access control</span>
          <span className="text-sky-700 dark:text-sky-400">
            HTTP 403 / AUTH_GATE
          </span>
        </div>

        <section className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_20px_45px_-15px_rgba(11,28,48,0.08)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                    Access blocked
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {requestCode}
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <TicketCheck
                    className="h-4 w-4 text-sky-700 dark:text-sky-400"
                    aria-hidden="true"
                  />
                  Requested workspace
                </div>
                <p className="truncate font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {requestedPath}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  Session status
                </div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {isAuthenticated
                    ? `Signed in as ${roleLabel}`
                    : "No active staff session"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-sky-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Go back
              </button>
              <button
                type="button"
                onClick={isAuthenticated ? goToWorkspace : goToLogin}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600/30 dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                {isAuthenticated ? (
                  <>
                    Open my workspace{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Sign in to continue
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <Home
            className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400"
            aria-hidden="true"
          />
          <span>Need access changed? Contact your lab administrator.</span>
        </div>
      </div>
    </>
  );
}
