import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Copy } from 'lucide-react-native';

interface TicketMetaHeaderProps {
  ticketNumber: string;
  requestNumber?: string;
  isLiveConnected?: boolean;
  onCopyTicket: () => void;
}

export const TicketMetaHeader: React.FC<TicketMetaHeaderProps> = ({
  ticketNumber,
  requestNumber,
  isLiveConnected = true,
  onCopyTicket,
}) => {
  return (
    <View className="px-4 pt-4 pb-2 flex-col gap-1">
      {/* Top Ref & Live Tracking row */}
      <View className="flex-row items-center justify-between">
        {requestNumber ? (
          <View className="bg-secondary-fixed/50 px-2.5 py-0.5 rounded-full">
            <Text className="text-xs font-bold text-secondary uppercase tracking-wider">
              Ref: {requestNumber}
            </Text>
          </View>
        ) : (
          <View />
        )}

        <View className="flex-row items-center gap-1.5">
          <View
            className={`w-2 h-2 rounded-full ${
              isLiveConnected ? 'bg-secondary' : 'bg-outline'
            }`}
          />
          <Text className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
            {isLiveConnected ? 'LIVE TRACKING' : 'CONNECTING'}
          </Text>
        </View>
      </View>

      {/* Main Ticket Title & Copy Action */}
      <View className="flex-row items-baseline justify-between mt-1">
        <Text className="text-2xl font-extrabold text-primary tracking-tight">
          Ticket #{ticketNumber}
        </Text>

        <TouchableOpacity
          onPress={onCopyTicket}
          activeOpacity={0.7}
          className="flex-row items-center gap-1 px-2 py-1 rounded-md active:bg-surface-container"
          accessibilityLabel="Copy ticket number"
          accessibilityRole="button"
        >
          <Copy size={15} color="#0051d5" />
          <Text className="text-xs font-semibold text-secondary">Copy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
