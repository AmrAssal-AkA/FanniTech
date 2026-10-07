import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';

import { AuthHeader } from '../../components/common/AuthHeader';
import { FanniTechLogo } from '../../components/common/FanniTechLogo';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { useAuthSession } from '../../features/auth/session/AuthSession';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLoginSubmit = async (data: { email: string; pass: string; remember: boolean }) => {
    setIsSubmitting(true);
    try {
      await signIn({ email: data.email.trim().toLowerCase(), password: data.pass, deviceInfo: 'FanniTech Mobile' });
      router.replace('/(app)/HomeScreen');
    } catch (error) {
      Alert.alert('Unable to sign in', error instanceof Error ? error.message : 'Please try again.');
    } finally { setIsSubmitting(false); }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password / reset flow
  };


  const handleNavigateSignup = () => {
    router.push('/(auth)/signup.screen');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Top Header */}
      <AuthHeader title="Login" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1 px-4"
        >
          {/* Brand & Intro Section */}
          <View className="items-center text-center mt-6 mb-6">
            <View className="relative mb-3.5 items-center justify-center rounded-2xl bg-surface-container p-3 shadow-sm border border-slate-100">
              <FanniTechLogo size={56} />
              <View className="absolute -bottom-1 -right-1 h-3.5 w-3.5 items-center justify-center">
                <View className="absolute h-3.5 w-3.5 rounded-full bg-secondary opacity-75" />
                <View className="h-3.5 w-3.5 rounded-full bg-secondary" />
              </View>
            </View>

            <View className="mb-2 flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Precision Service Hub
              </Text>
            </View>

            <Text className="text-2xl font-bold tracking-tight text-on-surface">
              Welcome Back
            </Text>
            <Text className="mt-1.5 max-w-[280px] text-center text-sm leading-5 text-on-surface-variant">
              Sign in to track your computer repairs and manage registered devices
            </Text>
          </View>

          {/* Authentication Form Component */}
          <LoginForm
            onSubmit={handleLoginSubmit}
            onForgotPassword={handleForgotPassword}
          />
          {isSubmitting && <ActivityIndicator className="mt-4" color="#0051d5" />}


          {/* Security Assurance Banner */}
          <View className="mt-6 flex-row items-center gap-3 rounded-xl bg-surface-container-low p-3.5 border border-slate-100 shadow-sm">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
              <ShieldCheck size={20} color="#0051d5" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs font-semibold text-on-surface">
                  Authorized Security Protocol
                </Text>
                <View className="h-1.5 w-1.5 rounded-full bg-secondary" />
              </View>
              <Text className="mt-0.5 text-[11px] text-on-surface-variant">
                256-bit encrypted authentication • Official FanniTech Service Network
              </Text>
            </View>
          </View>

          {/* Sign Up Prompt Footer */}
          <View className="my-8 flex-row items-center justify-center gap-1.5">
            <Text className="text-sm text-on-surface-variant">
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={handleNavigateSignup}
              activeOpacity={0.7}
              className="py-1 px-1"
              accessibilityRole="button"
            >
              <Text className="text-sm font-bold text-secondary">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
