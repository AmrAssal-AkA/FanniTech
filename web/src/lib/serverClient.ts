import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const serverClient: AxiosInstance = axios.create({
  baseURL: process.env.BACKEND_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

serverClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = config.headers;
  if (!headers) return config;

  const authHeader = (
    typeof headers.get === 'function'
      ? headers.get('Authorization')
      : headers['Authorization'] || headers['authorization']
  ) as string | undefined;

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const existingCookie = (
      typeof headers.get === 'function'
        ? headers.get('Cookie')
        : headers['Cookie'] || headers['cookie']
    ) as string | undefined;

    const cookieParts = existingCookie
      ? existingCookie.split(';').map((c) => c.trim()).filter(Boolean)
      : [];

    if (!cookieParts.some((c) => c.startsWith('x-access-token='))) {
      cookieParts.unshift(`x-access-token=${token}`);
    }

    const newCookieHeader = cookieParts.join('; ');
    if (typeof headers.set === 'function') {
      headers.set('Cookie', newCookieHeader);
    } else {
      headers['Cookie'] = newCookieHeader;
    }
  }

  return config;
});