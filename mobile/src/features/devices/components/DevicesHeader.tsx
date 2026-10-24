import React from 'react';
import { View, Text } from 'react-native';
import { Cpu } from 'lucide-react-native';

interface DevicesHeaderProps {
  registeredCount: number;
}

export const DevicesHeader: React.FC<DevicesHeaderProps> = ({
  registeredCount,
}) => {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-1.5 flex-1 min-w-0">
        <Text className="text-[26px] font-bold text-on-surface tracking-tight">
          My Devices
        </Text>
        <View className="px-2 py-0.5 rounded-full bg-surface-container-highest">
          <Text className="text-[11px] font-semibold text-primary">
            {registeredCount} Registered
          </Text>
        </View>
      </View>
      <View className="w-8 h-8 rounded-full bg-surface-container items-center justify-center">
        <Cpu size={18} color="#1e3a8a" />
      </View>
    </View>
  );
};
