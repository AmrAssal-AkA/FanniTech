import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCheck, Check } from 'lucide-react-native';

interface AlertHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

export const AlertHeader: React.FC<AlertHeaderProps> = ({
  unreadCount,
  onMarkAllRead,
}) => {
  const isAllRead = unreadCount === 0;

  return (
    <View className="px-4 pt-3 pb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-primary tracking-tight">
            Alerts & Updates
          </Text>
          <View
            className={`px-2 py-0.5 rounded-full ${
              isAllRead ? 'bg-surface-container-high' : 'bg-secondary'
            }`}
          >
            <Text
              className={`text-[11px] font-semibold ${
                isAllRead ? 'text-on-surface-variant' : 'text-on-secondary'
              }`}
            >
              {unreadCount > 0 ? `${unreadCount} New` : '0 New'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onMarkAllRead}
          disabled={isAllRead}
          activeOpacity={0.7}
          className={`flex-row items-center gap-1 p-1 -mr-1 ${
            isAllRead ? 'opacity-60' : 'opacity-100'
          }`}
          accessibilityRole="button"
          accessibilityLabel={isAllRead ? 'All alerts marked as read' : 'Mark all alerts as read'}
        >
          {isAllRead ? (
            <>
              <Check size={16} color="#0051d5" />
              <Text className="text-xs font-semibold text-secondary">
                Marked
              </Text>
            </>
          ) : (
            <>
              <CheckCheck size={16} color="#0051d5" />
              <Text className="text-xs font-semibold text-secondary">
                Mark all read
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-xs text-on-surface-variant mt-0.5">
        Laboratory dispatches & live benchwork updates
      </Text>
    </View>
  );
};
