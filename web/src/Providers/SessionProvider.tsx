"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import useSWR from "swr";
import { getStaffSession, postStaffLogout } from "@/app/api/auth";
import type { SessionContextValue, SessionResponse } from "@/types/session";

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, error, mutate } = useSWR<SessionResponse>("/api/auth/session", getStaffSession, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });

  const value = useMemo<SessionContextValue>(() => ({
    user: data?.user ?? null,
    isAuthenticated: data?.isAuthenticated ?? false,
    role: data?.user?.role ? String(data.user.role).toUpperCase() : null,
    isLoading: !data && !error,
    refreshSession: async () => {
      const result = await mutate();
      return result ?? { user: null, isAuthenticated: false };
    },
    logout: async () => {
      await postStaffLogout();
      await mutate({ user: null, isAuthenticated: false }, false);
    },
  }), [data, error, mutate]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used within SessionProvider");
  return session;
}
