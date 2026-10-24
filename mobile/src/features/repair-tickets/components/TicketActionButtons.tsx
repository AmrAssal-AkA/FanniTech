import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Phone, MessageSquare, ShieldCheck } from 'lucide-react-native';

interface TicketActionButtonsProps {
  onCall: () => void;
  onMessage: () => void;
}

export const TicketActionButtons: React.FC<TicketActionButtonsProps> = ({
  onCall,
  onMessage,
}) => {
  return (
    <View className="px-4 mt-3 mb-6 flex-col gap-3">
      {/* Action Buttons Row */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onCall}
          activeOpacity={0.8}
          className="flex-1 h-12 rounded-lg bg-primary items-center justify-center flex-row gap-2 shadow-sm"
          accessibilityLabel="Call service hub"
          accessibilityRole="button"
        >
          <Phone size={18} color="#ffffff" />
          <Text className="text-sm font-semibold text-on-primary">
            Call Service Hub
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onMessage}
          activeOpacity={0.8}
          className="flex-1 h-12 rounded-lg bg-surface-container-highest items-center justify-center flex-row gap-2 shadow-sm"
          accessibilityLabel="Message support"
          accessibilityRole="button"
        >
          <MessageSquare size={18} color="#0051d5" />
          <Text className="text-sm font-semibold text-on-surface">
            Message Support
          </Text>
        </TouchableOpacity>
      </View>

      {/* Guarantee Footer */}
      <View className="flex-row items-center justify-center gap-1.5 pt-1">
        <ShieldCheck size={16} color="#757682" />
        <Text className="text-xs font-semibold text-on-surface-variant">
          FanniTech Surgical Hardware Care Guarantee
        </Text>
      </View>
    </View>
  );
};

