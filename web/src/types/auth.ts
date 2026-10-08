export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "tech";
  branch?: string;
  token?: string;
}

export interface LoginCredentials {
  identifier: string;
  passphrase: string;
  role: "admin" | "tech";
  rememberWorkstation?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  stationId: string;
  node: string;
  expiresIn: number;
}
