import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';


export const tokenStorage = {
    getAccess: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    getRefresh: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

    getUser: async <T>() => {
        const value = await SecureStore.getItemAsync(USER_KEY);
        return value ? (JSON.parse(value) as T) : null;
    },

    save: async (accessToken: string, refreshToken: string, user?: unknown) => {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        if (user !== undefined) await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    },
    clear: async () => {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    }
}
