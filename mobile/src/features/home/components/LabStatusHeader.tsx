import React from 'react';
import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';

interface LabStatusHeaderProps {
  userName?: string;
  isLabOnline?: boolean;
  labHoursText?: string;
}

export const LabStatusHeader: React.FC<LabStatusHeaderProps> = ({
  userName = 'Sarah',
  isLabOnline = true,
  labHoursText = 'Open today until 7:00 PM',
}) => {
  return (
    <View className="pt-2 pb-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold tracking-tight text-on-surface">
          Welcome back, {userName}
        </Text>
        {isLabOnline && (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high">
            <View className="w-2 h-2 rounded-full bg-secondary" />
            <Text className="text-[11px] font-semibold text-primary">Lab Online</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center gap-1.5 mt-1.5">
        <Clock size={14} color="#0051d5" />
        <Text className="text-xs text-on-surface-variant">
          Repair Center Status:{' '}
          <Text className="font-semibold text-on-surface">{labHoursText}</Text>
        </Text>
      </View>
    </View>
  );
};
