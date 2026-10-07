import React from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ShieldCheck, Cpu, MailCheck } from "lucide-react-native";

import { AuthHeader } from "../../components/common/AuthHeader";
import { FanniTechLogo } from "../../components/common/FanniTechLogo";
import { SignupForm } from "../../features/auth/components/SignupForm";
import { useAuthSession } from "../../features/auth/session/AuthSession";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSignupSubmit = (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    agreedToTerms: boolean;
    confirmPassword: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert('Check your password', 'The passwords do not match.');
      return;
    }
    if (!data.agreedToTerms) {
      Alert.alert('Terms required', 'Please agree to the service terms and privacy policy.');
      return;
    }
    setIsSubmitting(true);
    void signUp({ email: data.email.trim().toLowerCase(), name: data.fullName.trim(), password: data.password, phone: data.phone.replace(/\s/g, ''), deviceInfo: 'FanniTech Mobile' })
      .then(() => router.replace('/(app)/HomeScreen'))
      .catch((error: unknown) => Alert.alert('Unable to create account', error instanceof Error ? error.message : 'Please try again.'))
      .finally(() => setIsSubmitting(false));
  };

  const handleNavigateLogin = () => {
    router.push("/(auth)/login.screen");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Top Header */}
      <AuthHeader title="Sign Up" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1 px-4"
        >
          {/* Header & Brand Intro */}
          <View className="items-center text-center mt-5 mb-5">
            <View className="mb-2.5 h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-low p-2 shadow-sm border border-slate-100">
              <FanniTechLogo size={48} />
            </View>

            <Text className="text-2xl font-bold tracking-tight text-on-surface">
              Create Customer Account
            </Text>
            <Text className="mt-1 max-w-[320px] text-center text-sm leading-5 text-on-surface-variant">
              Register to submit repair requests and track diagnostics in real
              time
            </Text>

            {/* Trust Badges Strip */}
            <View className="mt-3 flex-row items-center justify-center gap-2">
              <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-3 py-1 shadow-sm">
                <ShieldCheck size={14} color="#0051d5" />
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  ISO Cert Lab
                </Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-3 py-1 shadow-sm">
                <Cpu size={14} color="#0051d5" />
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  OEM Parts Only
                </Text>
              </View>
            </View>
          </View>

          {/* Registration Form Component */}
          <SignupForm onSubmit={handleSignupSubmit} />
          {isSubmitting && <ActivityIndicator className="mt-4" color="#0051d5" />}

          {/* Verification Notice Pill Card */}
          <View className="mt-4 flex-row items-start gap-2.5 rounded-lg bg-surface-container p-3.5 shadow-sm border border-slate-100">
            <MailCheck size={18} color="#0051d5" className="mt-0.5" />
            <Text className="flex-1 text-xs leading-5 text-on-surface-variant">
              You will receive an email verification link to activate your
              warranty and ticket notifications.
            </Text>
          </View>

          {/* Bottom Footer Link */}
          <View className="my-8 flex-row items-center justify-center gap-1.5">
            <Text className="text-sm text-on-surface-variant">
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={handleNavigateLogin}
              activeOpacity={0.7}
              className="py-1 px-1"
              accessibilityRole="button"
            >
              <Text className="text-sm font-bold text-secondary">Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
