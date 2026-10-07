import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCategory } from '../types';

interface AlertFilterTabsProps {
  activeFilter: AlertCategory;
  counts: {
    all: number;
    repairs: number;
    devices: number;
  };
  onSelectFilter: (filter: AlertCategory) => void;
}

export const AlertFilterTabs: React.FC<AlertFilterTabsProps> = ({
  activeFilter,
  counts,
  onSelectFilter,
}) => {
  const tabs: { id: AlertCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'repairs', label: 'Repairs', count: counts.repairs },
    { id: 'devices', label: 'Device Alerts', count: counts.devices },
  ];

  return (
    <View className="py-2.5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View className="flex-row items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onSelectFilter(tab.id)}
                activeOpacity={0.8}
                className={`px-3.5 py-1.5 rounded-full ${
                  isActive
                    ? 'bg-primary shadow-xs'
                    : 'bg-surface-container-high'
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${tab.label}`}
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
