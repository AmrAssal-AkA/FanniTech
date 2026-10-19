import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export const RepairTicketLoading: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-surface">
      <ActivityIndicator size="large" color="#00236f" />
      <Text className="text-sm font-semibold text-primary mt-4">
        Connecting to FanniTech Diagnostic Matrix...
      </Text>
      <Text className="text-xs text-on-surface-variant mt-1 text-center">
        Fetching live benchwork telemetry & repair ticket details
      </Text>
    </View>
  );
};

