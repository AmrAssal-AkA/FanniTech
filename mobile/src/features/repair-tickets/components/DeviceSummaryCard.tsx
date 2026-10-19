import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Laptop, Smartphone, AlertTriangle } from 'lucide-react-native';
import { RepairTicketDetail } from '../types';

interface DeviceSummaryCardProps {
  device: RepairTicketDetail['device'];
  problem: string;
  description: string;
}

export const DeviceSummaryCard: React.FC<DeviceSummaryCardProps> = ({
  device,
  problem,
  description,
}) => {
  const isSmartphone =
    device.deviceType?.toLowerCase().includes('phone') ||
    device.categoryLabel?.toLowerCase().includes('phone');

  const fullName =
    device.brand && !device.model.toLowerCase().includes(device.brand.toLowerCase())
      ? `${device.brand} ${device.model}`
      : device.model || device.brand || 'Registered Device';

  const serialText = device.serialNumber
    ? `SN: ${device.serialNumber}`
    : null;

  const specs = device.specs && device.specs.length > 0 ? device.specs : null;

  return (
    <View className="mx-4 my-2">
      <View className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/80 flex-col gap-3">
        {/* Device identity row */}
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3 flex-1 mr-2">
            <View className="w-12 h-12 rounded-lg bg-surface-container items-center justify-center shrink-0">
              {isSmartphone ? (
                <Smartphone size={26} color="#00236f" />
              ) : (
                <Laptop size={26} color="#00236f" />
              )}
            </View>

            <View className="flex-1">
              <Text
                className="text-base font-bold text-on-surface leading-tight"
                numberOfLines={1}
              >
                {fullName}
              </Text>
              {serialText ? (
                <Text className="text-xs text-on-surface-variant font-mono mt-0.5">
                  {serialText}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="bg-surface-container-high px-2 py-1 rounded">
            <Text className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              {device.categoryLabel || device.deviceType?.toUpperCase() || 'HARDWARE'}
            </Text>
          </View>
        </View>

        {/* Reported Issue Box */}
        <View className="bg-surface-container-low rounded-lg p-3 flex-col gap-1.5">
          <View className="flex-row items-center gap-1.5">
            <AlertTriangle size={15} color="#ba1a1a" />
            <Text className="text-[11px] font-bold text-error uppercase tracking-wide">
              Reported Issue
            </Text>
          </View>

          <Text className="text-xs font-bold text-on-surface leading-snug">
            {problem}
          </Text>

          {description ? (
            <Text className="text-xs text-on-surface-variant pt-0.5 leading-relaxed">
              {description.startsWith('“') ? description : `“${description}”`}
            </Text>
          ) : null}
        </View>

        {/* Specs snippet if available */}
        {specs && specs.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2 pt-0.5"
          >
            {specs.map((spec, idx) => (
              <View
                key={idx}
                className="bg-surface-container px-2.5 py-1 rounded-full mr-1.5"
              >
                <Text className="text-xs font-semibold text-on-surface-variant">
                  {spec}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
};
