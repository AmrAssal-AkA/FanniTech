import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProfileStats } from '../types';

interface ProfileStatsRowProps {
  stats: ProfileStats;
  onDevicesPress: () => void;
  onRepairsPress: () => void;
}

export const ProfileStatsRow: React.FC<ProfileStatsRowProps> = ({
  stats,
  onDevicesPress,
  onRepairsPress,
}) => {
  return (
    <View className="flex-row gap-2">
      {/* Registered Devices */}
      <TouchableOpacity
        onPress={onDevicesPress}
        activeOpacity={0.8}
        className="flex-1 bg-surface-container rounded-xl p-3 items-center"
        accessibilityRole="button"
        accessibilityLabel={`${stats.registeredDevices} registered devices`}
      >
        <Text className="text-primary text-xl font-bold">
          {stats.registeredDevices}
        </Text>
        <Text className="text-on-surface-variant text-xs font-semibold text-center mt-0.5 leading-tight">
          Registered{'\n'}Devices
        </Text>
      </TouchableOpacity>

      {/* Active Repairs — highlighted with pulse indicator */}
      <TouchableOpacity
        onPress={onRepairsPress}
        activeOpacity={0.8}
        className="flex-1 bg-secondary/10 rounded-xl p-3 items-center relative"
        accessibilityRole="button"
        accessibilityLabel={`${stats.activeRepairs} active repairs`}
      >
        {stats.activeRepairs > 0 && (
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary" />
        )}
        <Text className="text-secondary text-xl font-bold">
          {stats.activeRepairs}
        </Text>
        <Text className="text-secondary text-xs font-semibold text-center mt-0.5 leading-tight">
          Active{'\n'}Repair
        </Text>
      </TouchableOpacity>

      {/* Completed Repairs */}
      <TouchableOpacity
        onPress={onRepairsPress}
        activeOpacity={0.8}
        className="flex-1 bg-surface-container rounded-xl p-3 items-center"
        accessibilityRole="button"
        accessibilityLabel={`${stats.completedRepairs} completed repairs`}
      >
        <Text className="text-primary text-xl font-bold">
          {stats.completedRepairs}
        </Text>
        <Text className="text-on-surface-variant text-xs font-semibold text-center mt-0.5 leading-tight">
          Completed{'\n'}Repairs
        </Text>
      </TouchableOpacity>
    </View>
  );
};
