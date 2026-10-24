import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Laptop, ChevronRight } from 'lucide-react-native';
import { RegisteredDevice } from '../types';

interface RegisteredDevicesSectionProps {
  devices: RegisteredDevice[];
  onViewAll?: () => void;
  onSelectDevice?: (deviceId: string) => void;
  onAddNewDevice?: () => void;
}

export const RegisteredDevicesSection: React.FC<RegisteredDevicesSectionProps> = ({
  devices,
  onViewAll,
  onSelectDevice,
  onAddNewDevice,
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

      {/* Grid of registered devices or empty state */}
      {devices.length === 0 ? (
        <View className="bg-surface-container-lowest rounded-2xl p-5 border border-slate-100 items-center justify-center">
          <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center mb-2">
            <Laptop size={20} color="#757682" />
          </View>
          <Text className="text-sm font-semibold text-on-surface text-center">
            No Registered Devices
          </Text>
          <Text className="text-xs text-outline text-center mt-1">
            Register your device to schedule repairs and track hardware status.
          </Text>
          {onAddNewDevice && (
            <TouchableOpacity
              onPress={onAddNewDevice}
              activeOpacity={0.75}
              className="mt-3 px-4 py-2 bg-secondary rounded-xl"
              accessibilityRole="button"
              accessibilityLabel="Register a device"
            >
              <Text className="text-xs font-bold text-on-secondary">
                + Register Device
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="flex-row gap-3">
          {devices.slice(0, 2).map((device) => {
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
    )}
    </View>
  );
};
