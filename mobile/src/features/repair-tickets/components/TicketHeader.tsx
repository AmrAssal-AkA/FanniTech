import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, User } from 'lucide-react-native';

interface TicketHeaderProps {
  onBack: () => void;
  onProfilePress?: () => void;
  title?: string;
}

export const TicketHeader: React.FC<TicketHeaderProps> = ({
  onBack,
  onProfilePress,
  title = 'Repair Detail',
}) => {
  return (
    <View className="h-16 px-4 flex-row items-center justify-between border-b border-surface-container/60 bg-surface">
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full items-center justify-center bg-transparent active:bg-surface-container"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color="#131b2e" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-on-surface tracking-tight"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onProfilePress}
        activeOpacity={0.8}
        className="w-8 h-8 rounded-full bg-primary items-center justify-center"
        accessibilityLabel="User profile"
        accessibilityRole="button"
      >
        <User size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

