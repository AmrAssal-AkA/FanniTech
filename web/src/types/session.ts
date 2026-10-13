import type { User, UserRole } from "@/types/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
}

export interface SessionResponse {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

export interface SessionContextValue extends SessionResponse {
  role: string | null;
  isLoading: boolean;
  refreshSession: () => Promise<SessionResponse>;
  logout: () => Promise<void>;
}

export const toSessionUser = (user: User): SessionUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});
