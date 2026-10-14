export type UserRole = "ADMIN" | "TECHNICIAN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string | null;
  Access_token?: string | null;
  createdAt?: string;
  updatedAt?: string;
  node?: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceInfo?: string;
  rememberWorkstation?: boolean;
  data?: {
    email: string;
    password: string;
    deviceInfo?: string;
    rememberWorkstation?: boolean;
  };
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  node?: string;
  expiresIn?: number;
}


