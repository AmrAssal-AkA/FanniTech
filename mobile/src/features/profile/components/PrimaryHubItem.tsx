import React from 'react';
import { View, Text } from 'react-native';
import { MapPin, Store } from 'lucide-react-native';
import { PrimaryRepairHub } from '../types';

interface PrimaryHubItemProps {
  hub: PrimaryRepairHub;
}

export const PrimaryHubItem: React.FC<PrimaryHubItemProps> = ({ hub }) => {
  return (
    <View className="px-4 py-3.5">
      {/* Header row */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-lg bg-surface-container items-center justify-center">
          <Store size={20} color="#00236f" />
        </View>
        <View className="flex-col flex-1 min-w-0">
          <Text className="text-on-surface text-sm font-semibold">
            Primary Repair Hub
          </Text>
          <Text className="text-on-surface-variant text-xs mt-0.5">
            Default drop-off & pick-up location
          </Text>
        </View>
      </View>

      {/* Hub detail card */}
      <View className="mt-3 bg-surface-container-low rounded-lg px-3 py-2.5 flex-row items-start gap-2">
        <MapPin size={16} color="#0051d5" style={{ marginTop: 2 }} />
        <View className="flex-col flex-1 min-w-0">
          <Text className="text-on-surface text-xs font-bold">{hub.name}</Text>
          <Text className="text-on-surface-variant text-xs mt-0.5 leading-snug">
            {hub.address}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-secondary text-xs font-bold">{hub.id}</Text>
            <Text className="text-outline text-xs">•</Text>
            <Text className="text-secondary text-xs font-semibold">
              Bench: {hub.benchHours}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

