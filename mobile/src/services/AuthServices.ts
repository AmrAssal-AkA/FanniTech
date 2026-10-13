import axios from 'axios';

import { serverClient } from '../utils/serverClient';

export type AuthUser = { id: string; email: string; name: string; phone?: string | null; role: string; createdAt?: string; updatedAt?: string };
export type AuthSession = { user: AuthUser; accessToken: string; refreshToken: string };
export type RegisterInput = { email: string; name: string; password: string; phone?: string; deviceInfo?: string };
export type LoginInput = { email: string; password: string; deviceInfo?: string };

export class AuthServiceError extends Error {
  constructor(message: string, readonly status?: number) { super(message); this.name = 'AuthServiceError'; }
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) return 'Unable to connect to FanniTech. Check your internet connection.';
  const message = error.response.data?.message;
  if (error.response.status === 409) return 'An account with this email already exists.';
  if (Array.isArray(message)) return message[0] ?? fallback;
  return typeof message === 'string' ? message : fallback;
};

const request = async (operation: () => Promise<{ data: AuthSession }>, fallback: string) => {
  try { return (await operation()).data; }
  catch (error) {
    throw new AuthServiceError(getErrorMessage(error, fallback), axios.isAxiosError(error) ? error.response?.status : undefined);
  }
};

export const AuthServices = {
  register: (input: RegisterInput) => request(
    () => serverClient.post<AuthSession>('/api/v1/auth/mobile/register', input),
    'Unable to create your account. Check your details and try again.',
  ),
  login: (input: LoginInput) => request(
    () => serverClient.post<AuthSession>('/api/v1/auth/mobile/login', input),
    'Unable to sign you in. Check your email and password.',
  ),
  logout: async (refreshToken: string | null) => {
    if (!refreshToken) return;
    try { await serverClient.post('/api/v1/auth/logout', { refreshToken }); } catch { /* local cleanup still runs */ }
  },
};

export default AuthServices;
