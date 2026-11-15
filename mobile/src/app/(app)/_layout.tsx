import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsive } from "../../hooks/useResponsive";

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { isCompact, isTablet, scaleFont, scaleSize } = useResponsive();
  const iconSize = scaleSize(isCompact ? 20 : 22);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarAllowFontScaling: true,
        tabBarActiveTintColor: "#00236F",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontSize: scaleFont(11),
          fontWeight: "600",
          marginTop: -2,
        },
        tabBarItemStyle: {
          paddingVertical: isCompact ? 4 : 6,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          height: scaleSize(60) + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
          marginHorizontal: isTablet ? 48 : isCompact ? 8 : 12,
          borderRadius: scaleSize(32),
          borderWidth: 1,
          borderColor: "#E2E8F0",
          backgroundColor: "#FFFFFF",
          elevation: 6,
          shadowColor: "#0F172A",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="DeviceScreen"
        options={{
          title: "Devices",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "desktop" : "desktop-outline"}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="AlertScreen"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="RepairRequestScreen"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="RepairRequestsListScreen"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="RepairTicketScreen"
        options={{ href: null, headerShown: false }}
      />
    </Tabs>
  );
}
