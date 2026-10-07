import React from 'react';
import { View, Text } from 'react-native';
import { AlertItem } from '../types';
import { AlertCard } from './AlertCard';

interface AlertSectionGroupProps {
  title: string;
  badge?: string;
  alerts: AlertItem[];
  onAlertPress: (alert: AlertItem) => void;
  onActionPress?: (alert: AlertItem) => void;
}

export const AlertSectionGroup: React.FC<AlertSectionGroupProps> = ({
  title,
  badge,
  alerts,
  onAlertPress,
  onActionPress,
}) => {
  if (alerts.length === 0) return null;

  return (
    <View className="flex-col gap-2.5">
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs font-bold text-outline uppercase tracking-wider">
          {title}
        </Text>
        {badge && (
          <Text className="text-[11px] font-semibold text-secondary">
            {badge}
          </Text>
        )}
      </View>

      {/* Alert Items List */}
      <View className="flex-col gap-2.5">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onPress={onAlertPress}
            onActionPress={onActionPress}
          />
        ))}
      </View>
    </View>
  );
};
