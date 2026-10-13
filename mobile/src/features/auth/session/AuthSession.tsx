import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { AuthServices, AuthSession, AuthUser, LoginInput, RegisterInput } from '../../../services/AuthServices';
import { getSessionExpiredHandler } from '../../../utils/serverClient';
import { tokenStorage } from '../services/tokenStorage';
import { socketService } from '../../../services/socketService';
import { registerForPushNotificationsAsync } from '../../../services/pushNotificationService';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';
type SessionContextValue = {
  status: SessionStatus;
  user: AuthUser | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};
const SessionContext = createContext<SessionContextValue | null>(null);

const persistSession = async ({ user, accessToken, refreshToken }: AuthSession) =>
  tokenStorage.save(accessToken, refreshToken, user);

async function initRealtime(): Promise<void> {
  await socketService.connect();
  void registerForPushNotificationsAsync();
}

export function AuthSessionProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let mounted = true;
    void tokenStorage.getUser<AuthUser>().then((storedUser) => {
      if (!mounted) return;
      setUser(storedUser);
      setStatus(storedUser ? 'authenticated' : 'unauthenticated');
      if (storedUser) {
        void initRealtime();
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    getSessionExpiredHandler(() => {
      socketService.disconnect();
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => {
      getSessionExpiredHandler(() => {});
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      signIn: async (input) => {
        const session = await AuthServices.login(input);
        await persistSession(session);
        setUser(session.user);
        setStatus('authenticated');
        void initRealtime();
      },
      signUp: async (input) => {
        const session = await AuthServices.register(input);
        await persistSession(session);
        setUser(session.user);
        setStatus('authenticated');
        void initRealtime();
      },
      signOut: async () => {
        socketService.disconnect();
        const refreshToken = await tokenStorage.getRefresh();
        await AuthServices.logout(refreshToken);
        await tokenStorage.clear();
        setUser(null);
        setStatus('unauthenticated');
      },
    }),
    [status, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useAuthSession must be used inside AuthSessionProvider');
  return context;
}
