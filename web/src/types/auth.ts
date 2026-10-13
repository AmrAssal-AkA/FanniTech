export type UserRole = "ADMIN" | "TECHNICIAN" | "CUSTOMER" | "admin" | "tech";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  EmailVerifyAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  branch?: string;
  token?: string;
}

export interface LoginCredentials {
  email?: string;
  identifier?: string;
  password?: string;
  passphrase?: string;
  deviceInfo?: string;
  role?: string;
  rememberWorkstation?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  stationId?: string;
  node?: string;
  expiresIn?: number;
}
