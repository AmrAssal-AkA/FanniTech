import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

import {tokenStorage} from '../features/auth/services/tokenStorage'

const baseURL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export const serverClient: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

let onSessionExpired: () => void = () => {};
export const getSessionExpiredHandler = (fn: () => void) => (onSessionExpired = fn);

serverClient.interceptors.request.use(async (config) => {
    const token = await tokenStorage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string> {
    const refreshToken = await tokenStorage.getRefresh();
    if (!refreshToken) throw new Error('No refresh token available');

    const {data} = await axios.post(`${baseURL}/api/v1/auth/refresh`, { refreshToken, service: 'mobile' }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    await tokenStorage.save(data.accessToken, data.refreshToken, data.user);
    return data.accessToken;
}

/*  this function refreshes the access token when it expires */
serverClient.interceptors.response.use((res) => res, async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes('/api/v1/auth/');
    if (original && error.response?.status === 401 && !isAuthCall && !original._retry) {
        original._retry = true;
        try {
            refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null; });
            const newAccessToken = await refreshPromise;
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return serverClient(original);
        } catch {
            await tokenStorage.clear();
            onSessionExpired();
        }
    }
    return Promise.reject(error);
});
