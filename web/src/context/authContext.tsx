"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { isAdmin as checkIsAdmin, isTechnician as checkIsTechnician } from "@/lib/auth/roles";
import type { LoginCredentials, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: User["role"] | null;
  isAdmin: boolean;
  isTechnician: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.me();
      const authenticated = response.success && Boolean(response.data);
      setUser(authenticated ? response.data ?? null : null);
      return authenticated;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshSession(); }, [refreshSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } finally { setUser(null); }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;
    return { user, loading, isAuthenticated: Boolean(user), role, isAdmin: checkIsAdmin(role), isTechnician: checkIsTechnician(role), login, logout, refreshSession };
  }, [user, loading, login, logout, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

