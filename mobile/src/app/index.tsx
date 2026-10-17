import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Cpu,
  Activity,
  Zap,
  Lock,
} from 'lucide-react-native';


export default function WelcomeScreen() {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push('/(auth)/signup.screen');
  };

  const handleSignIn = () => {
    router.push('/(auth)/login.screen');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Decorative atmospheric ambient glows */}
      <View
        pointerEvents="none"
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-secondary-container/15 blur-3xl"
      />
      <View
        pointerEvents="none"
        className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-primary-fixed/30 blur-3xl"
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 py-3"
      >
        <View className="flex-1 justify-between">
          {/* Top telemetry bar */}
          <View className="flex-row items-center justify-between pb-2">
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 shadow-sm">
              <View className="relative h-2 w-2 items-center justify-center">
                <View className="absolute h-2 w-2 rounded-full bg-secondary opacity-75" />
                <View className="h-2 w-2 rounded-full bg-secondary" />
              </View>
              <Text className="text-xs font-semibold tracking-wide text-primary">
                  Alex Central Lab: Active & Receiving
              </Text>
            </View>

            <View className="flex-row items-center gap-1 rounded bg-surface-container-high px-2 py-1">
              <Zap size={13} color="#0051d5" />
              <Text className="text-[11px] font-bold tracking-wider text-on-surface-variant">
                18ms
              </Text>
            </View>
          </View>

          {/* Center Brand & Hero identity */}
          <View className="items-center text-center pt-4">
            {/* Logo container with elevated depth & verified seal */}
            <View className="relative mb-4 items-center justify-center">
              <View className="absolute -inset-2 rounded-3xl bg-secondary/15 blur-md" />
              <View className="relative h-28 w-28 items-center justify-center rounded-2xl bg-surface-container-lowest p-2 shadow-lg border border-slate-100">
                <Image source={require('../../assets/icon.png')} className="h-20 w-20" />
              </View>
              <View className="absolute -bottom-1 -right-1 items-center justify-center rounded-full bg-primary p-1.5 shadow-md">
                <ShieldCheck size={14} color="#ffffff" />
              </View>
            </View>

            {/* App title with bilingual inscription */}
            <View className="items-center space-y-1">
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-2xl font-bold tracking-tight text-primary">
                  FanniTech
                </Text>
                <Text className="text-xl font-normal text-outline-variant">|</Text>
                <Text className="text-2xl font-bold tracking-tight text-secondary">
                  فني تك
                </Text>
              </View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Precision Computer & Laptop Diagnostic Hub
              </Text>
            </View>

            <Text className="mt-3 max-w-xs text-center text-sm leading-5 text-outline">
              Direct technician telemetry, cleanroom component repairs, and calibrated hardware diagnostics.
            </Text>
          </View>

          {/* Diagnostic Lab Trust Metrics (Bento-style 3 badges) */}
          <View className="flex-row gap-2 py-5">
            <View className="flex-1 items-center rounded-xl bg-surface-container-low p-3 text-center shadow-sm">
              <View className="mb-1.5 h-8 w-8 items-center justify-center rounded-full bg-primary-fixed">
                <ShieldCheck size={18} color="#00164e" />
              </View>
              <Text className="text-xs font-semibold text-on-surface">ISO 9001</Text>
              <Text className="text-[10px] text-on-surface-variant">Certified Lab</Text>
            </View>

            <View className="flex-1 items-center rounded-xl bg-surface-container-low p-3 text-center shadow-sm">
              <View className="mb-1.5 h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed">
                <Activity size={18} color="#00174b" />
              </View>
              <Text className="text-xs font-semibold text-on-surface">Live Telemetry</Text>
              <Text className="text-[10px] text-on-surface-variant">Bench Stream</Text>
            </View>

            <View className="flex-1 items-center rounded-xl bg-surface-container-low p-3 text-center shadow-sm">
              <View className="mb-1.5 h-8 w-8 items-center justify-center rounded-full bg-tertiary-fixed">
                <Cpu size={18} color="#001e2c" />
              </View>
              <Text className="text-xs font-semibold text-on-surface">OEM Genuine</Text>
              <Text className="text-[10px] text-on-surface-variant">Tier-1 Spares</Text>
            </View>
          </View>

          {/* Actions & Navigation Panel */}
          <View className="space-y-3 pt-2">
            {/* Primary Action: Get Started */}
            <TouchableOpacity
              onPress={handleCreateAccount}
              activeOpacity={0.88}
              className="h-12 w-full flex-row items-center justify-center gap-2 rounded-lg bg-primary shadow-md"
              accessibilityRole="button"
              accessibilityLabel="Get Started • Create Account"
            >
              <Text className="text-sm font-semibold text-on-primary">
                Get Started • Create Account
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>

            {/* Secondary Action: Sign In */}
            <TouchableOpacity
              onPress={handleSignIn}
              activeOpacity={0.85}
              className="h-12 w-full flex-row items-center justify-center gap-2 rounded-lg bg-surface-container-lowest border border-slate-200 shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="I already have an account • Sign In"
            >
              <KeyRound size={18} color="#757682" />
              <Text className="text-sm font-semibold text-on-surface">
                I already have an account • Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security safeguard footer */}
          <View className="items-center justify-center py-4">
            <View className="flex-row items-center gap-1.5">
              <Lock size={13} color="#0051d5" />
              <Text className="text-xs font-medium text-outline">
                End-to-End Serialized Telemetry Encryption
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}