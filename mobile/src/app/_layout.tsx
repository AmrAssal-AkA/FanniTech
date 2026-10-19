import React from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import '../../global.css';
import { AuthSessionProvider, useAuthSession } from '../features/auth/session/AuthSession';
import { Redirect, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from '../hooks/useNotifications';

const queryClient = new QueryClient();

function SessionGate() {
  const { status } = useAuthSession();
  const segments = useSegments();
  useNotifications();

  const inAuth = segments[0] === '(auth)';
  const inApp = segments[0] === '(app)';

  if (status === 'loading') return null;
  if (status === 'unauthenticated' && inApp) return <Redirect href="/(auth)/login.screen" />;
  if (status === 'authenticated' && !inApp) return <Redirect href="/(app)/HomeScreen" />;
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ title: 'Auth', headerShown: false }} />
      <Stack.Screen name="(app)" options={{ title: 'App', headerShown: false }} />
    </Stack>
  );
}

// Hide the splash screen after a delay to ensure smooth transition
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <SessionGate />
      </AuthSessionProvider>
    </QueryClientProvider>
  );
}
