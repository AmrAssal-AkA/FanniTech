import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, RefreshCw } from 'lucide-react-native';

interface AllCaughtUpProps {
  isFiltered?: boolean;
}

export const AllCaughtUp: React.FC<AllCaughtUpProps> = ({ isFiltered = false }) => {
  return (
    <View className="mt-8 mb-4 items-center text-center px-4">
      <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center mb-2.5">
        <CheckCircle2 size={24} color="#0051d5" />
      </View>
      <Text className="text-base font-bold text-on-surface">
        {isFiltered ? 'End of Filtered Results' : 'All Caught Up'}
      </Text>
      <Text className="text-xs text-on-surface-variant mt-0.5 text-center max-w-xs leading-relaxed">
        {isFiltered
          ? 'No further notifications in this category.'
          : "You're all caught up with your service alerts and live benchwork tickets."}
      </Text>
      <View className="flex-row items-center gap-1.5 mt-3">
        <RefreshCw size={13} color="#757682" />
        <Text className="text-[11px] text-outline font-medium">
          Live bench synchronization active
        </Text>
      </View>
    </View>
  );
};
