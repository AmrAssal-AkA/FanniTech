import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Laptop, ChevronRight } from 'lucide-react-native';
import { RegisteredDevice } from '../types';

interface RegisteredDevicesSectionProps {
  devices: RegisteredDevice[];
  onViewAll?: () => void;
  onSelectDevice?: (deviceId: string) => void;
}

export const RegisteredDevicesSection: React.FC<RegisteredDevicesSectionProps> = ({
  devices,
  onViewAll,
  onSelectDevice,
}) => {
  return (
    <View className="space-y-2.5">
      {/* Section Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-on-surface">
          My Registered Devices
        </Text>
        <TouchableOpacity
          onPress={onViewAll}
          activeOpacity={0.7}
          className="flex-row items-center gap-0.5 py-1"
          accessibilityLabel="View all registered devices"
          accessibilityRole="button"
        >
          <Text className="text-xs font-semibold text-secondary">
            View All ({devices.length})
          </Text>
          <ChevronRight size={14} color="#0051d5" />
        </TouchableOpacity>
      </View>

      {/* Grid of registered devices */}
      <View className="flex-row gap-3">
        {devices.map((device) => {
          const isInService = device.status === 'IN_SERVICE';

          return (
            <TouchableOpacity
              key={device.id}
              onPress={() => onSelectDevice?.(device.id)}
              activeOpacity={0.75}
              className="flex-1 bg-surface-container-lowest rounded-2xl p-3 border border-slate-100 shadow-xs space-y-2"
              accessibilityLabel={`${device.name}, status ${device.statusLabel}`}
              accessibilityRole="button"
            >
              <View className="flex-row items-center justify-between">
                <View
                  className={`w-8 h-8 rounded-lg items-center justify-center ${
                    isInService ? 'bg-surface-container-high' : 'bg-surface-container'
                  }`}
                >
                  <Laptop
                    size={18}
                    color={isInService ? '#00236f' : '#444651'}
                    strokeWidth={2}
                  />
                </View>
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    isInService
                      ? 'bg-secondary-container'
                      : 'bg-surface-container-highest'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-semibold ${
                      isInService
                        ? 'text-on-secondary-container'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {device.statusLabel}
                  </Text>
                </View>
              </View>

              <View>
                <Text
                  className="text-xs font-bold text-on-surface leading-tight"
                  numberOfLines={1}
                >
                  {device.name}
                </Text>
                <Text
                  className="text-[11px] text-outline mt-0.5 leading-tight"
                  numberOfLines={1}
                >
                  {device.activeTicketNumber
                    ? `Ticket ${device.activeTicketNumber}`
                    : 'No Active Repair'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
