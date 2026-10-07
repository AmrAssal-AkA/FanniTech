import React from 'react';
import { View, Text } from 'react-native';
import { SlidersHorizontal, MessageSquare, Bell, Mail } from 'lucide-react-native';
import { NotificationChannel } from '../types';

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  sms: MessageSquare,
  email: Mail,
  push: Bell,
};

interface NotificationChannelsItemProps {
  channels: NotificationChannel[];
}

export const NotificationChannelsItem: React.FC<NotificationChannelsItemProps> = ({
  channels,
}) => {
  return (
    <View className="px-4 py-3.5">
      {/* Header row */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-lg bg-surface-container items-center justify-center">
          <SlidersHorizontal size={20} color="#00236f" />
        </View>
        <View className="flex-col">
          <Text className="text-on-surface text-sm font-semibold">
            Notification Channels
          </Text>
          <Text className="text-on-surface-variant text-xs mt-0.5">
            Live hardware state updates
          </Text>
        </View>
      </View>

      {/* Channel badges */}
      <View className="mt-3 gap-2">
        {channels.map((channel) => {
          const Icon = CHANNEL_ICONS[channel.id] ?? Bell;
          return (
            <View
              key={channel.id}
              className="flex-row items-center justify-between bg-surface-container-low/60 rounded-lg px-3 py-2"
            >
              <View className="flex-row items-center gap-2">
                <Icon size={16} color="#444651" />
                <Text className="text-on-surface text-xs font-medium">
                  {channel.label}
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-full bg-secondary-fixed">
                <Text className="text-xs font-semibold text-on-surface-variant">
                  {channel.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

