import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

interface DevicesErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const DevicesErrorState: React.FC<DevicesErrorStateProps> = ({
  message,
  onRetry,
}) => {
  return (
    <View className="mt-10 mb-4 items-center px-4">
      <Text className="text-base font-bold text-on-surface">
        Could not load devices
      </Text>
      <Text className="text-xs text-on-surface-variant mt-0.5 text-center max-w-xs leading-relaxed">
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.8}
        className="mt-3 min-h-[48px] px-4 rounded-lg bg-surface-container-high flex-row items-center justify-center gap-2"
        accessibilityRole="button"
        accessibilityLabel="Retry loading devices"
      >
        <RefreshCw size={16} color="#00236f" />
        <Text className="text-xs font-semibold text-primary">Try again</Text>
      </TouchableOpacity>
    </View>
  );
};
