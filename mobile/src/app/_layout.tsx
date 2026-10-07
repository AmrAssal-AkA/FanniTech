import React from 'react';
import { Stack } from 'expo-router';

import '../../global.css';
import { AuthSessionProvider, useAuthSession } from '../features/auth/session/AuthSession';
import { Redirect, useSegments } from 'expo-router';

function SessionGate() {
  const { status } = useAuthSession();
  const segments = useSegments();
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

export default function RootLayout() {
  return (
    <AuthSessionProvider>
      <SessionGate />
    </AuthSessionProvider>
  );
}
