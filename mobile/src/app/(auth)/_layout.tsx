import React from 'react'
import { Stack } from 'expo-router'


export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="login.screen" options={{ title: 'Login' , headerShown: false }} />
            <Stack.Screen name="signup.screen" options={{ title: 'Sign Up' , headerShown: false }} />
        </Stack>
    )
}