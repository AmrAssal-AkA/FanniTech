import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface RepairTicketErrorProps {
  message?: string;
  onRetry: () => void;
}

export const RepairTicketError: React.FC<RepairTicketErrorProps> = ({
  message = 'Failed to load repair ticket telemetry.',
  onRetry,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-surface">
      <View className="w-14 h-14 rounded-full bg-error-container items-center justify-center mb-3">
        <AlertCircle size={28} color="#ba1a1a" />
      </View>
      <Text className="text-base font-bold text-on-surface text-center">
        Unable to Load Ticket
      </Text>
      <Text className="text-xs text-on-surface-variant text-center mt-1 mb-5 max-w-xs leading-relaxed">
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.8}
        className="px-5 py-2.5 rounded-lg bg-primary flex-row items-center gap-2 shadow-sm"
        accessibilityLabel="Retry loading ticket"
        accessibilityRole="button"
      >
        <RefreshCw size={16} color="#ffffff" />
        <Text className="text-xs font-semibold text-on-primary">
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
};

