import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Wrench, Bell, User } from "lucide-react-native";

interface HomeHeaderProps {
  hasUnreadNotifications?: boolean;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  hasUnreadNotifications = true,
  onNotificationsPress,
  onProfilePress,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-surface/80 border-b border-surface-container-high/60">
      {/* Brand logo & title */}
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-lg bg-primary items-center justify-center shadow-xs">
          <Wrench size={18} color="#ffffff" strokeWidth={2.2} />
        </View>
        <View>
          <Text className="text-base font-bold text-primary tracking-tight leading-tight">
            FanniTech
          </Text>
          <Text className="text-[10px] text-outline font-semibold uppercase tracking-wider leading-tight mt-0.5">
            Customer Lab
          </Text>
        </View>
      </View>

      {/* Header action icons */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={onNotificationsPress}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full items-center justify-center relative bg-surface-container/60"
          accessibilityLabel="View alerts and notifications"
          accessibilityRole="button"
        >
          <Bell size={20} color="#444651" />
          {hasUnreadNotifications && (
            <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.7}
          className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-xs"
          accessibilityLabel="View profile"
          accessibilityRole="button"
        >
          <User size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
