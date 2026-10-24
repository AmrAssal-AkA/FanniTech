import React from 'react';
import { Text, View } from 'react-native';
import { Laptop } from 'lucide-react-native';

export const DevicesEmptyState: React.FC = () => {
  return (
    <View className="mt-10 mb-4 items-center px-4">
      <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center mb-2.5">
        <Laptop size={24} color="#0051d5" />
      </View>
      <Text className="text-base font-bold text-on-surface">
        No devices registered
      </Text>
      <Text className="text-xs text-on-surface-variant mt-0.5 text-center max-w-xs leading-relaxed">
        Register a laptop or desktop to track repairs, serials, and service
        history.
      </Text>
    </View>
  );
};
