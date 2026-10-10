import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Laptop,
  Monitor,
  MoreVertical,
  Info,
  RefreshCw,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { DeviceWithRepairState } from '../types';

{/* compoents of the UI*/}
import { getPrimaryAction } from './ui/getPrimaryAction';
import { getLocationDotClass } from './ui/getLocationDotClass';
import { getLocationTextClass } from './ui/getLocationTextClass';
import { getStatusBannerClass } from './ui/getStatusBannerClass';
import {getStatusTextClass} from './ui/getStatusTextClass'


interface DeviceCardProps {
  device: DeviceWithRepairState;
  onViewDetails: (device: DeviceWithRepairState) => void;
  onPrimaryAction: (device: DeviceWithRepairState) => void;
  onOpenMenu: (device: DeviceWithRepairState) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onViewDetails,
  onPrimaryAction,
  onOpenMenu,
}) => {
  const name = `${device.brand} ${device.model}`;
  const isDesktop = device.deviceType.toLowerCase() === 'desktop';
  const DeviceIcon = isDesktop ? Monitor : Laptop;

  const primaryAction = getPrimaryAction(device.repairState);

  return (
    <View className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm flex-col gap-2 relative overflow-hidden">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-row items-start gap-2 min-w-0 flex-1">
          <View className="w-12 h-12 rounded-lg bg-surface-container items-center justify-center flex-shrink-0">
            <DeviceIcon size={26} color="#00236f" strokeWidth={2} />
          </View>
          <View className="flex-col min-w-0 flex-1">
            <Text
              className="text-lg font-semibold text-on-surface"
              numberOfLines={1}
            >
              {name}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View className="px-1.5 py-0.5 rounded bg-surface-container-high">
                <Text className="text-[11px] font-semibold text-on-surface-variant">
                  {device.deviceType}
                </Text>
              </View>
              <Text className="text-[11px] text-outline">•</Text>
              <Text className="text-[11px] font-medium text-on-surface-variant">
                {device.brand}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onOpenMenu(device)}
          activeOpacity={0.7}
          className="w-11 h-11 -mr-1 items-center justify-center rounded-full"
          accessibilityRole="button"
          accessibilityLabel={`More actions for ${name}`}
        >
          <MoreVertical size={20} color="#757682" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between bg-surface-container-low px-2 py-1.5 rounded-lg">
        <View className="flex-row items-center gap-1 min-w-0 flex-1">
          <Text className="text-xs text-outline uppercase font-bold">S/N:</Text>
          <Text
            className="text-[13px] font-bold text-on-surface tracking-wide"
            numberOfLines={1}
          >
            {device.serialNumber ?? 'Not provided'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1 ml-2">
          <View
            className={`w-1.5 h-1.5 rounded-full ${getLocationDotClass(
              device.repairState
            )}`}
          />
          <Text
            className={`text-[11px] font-semibold ${getLocationTextClass(
              device.repairState
            )}`}
          >
            {device.repairState === 'ACTIVE_REPAIR' ? 'In service' : device.repairState === 'PENDING_REQUEST' ? 'Quote review' : 'Ready'}
          </Text>
        </View>
      </View>

      <View
        className={`w-full flex-row items-center gap-2 px-2 py-2 rounded-lg ${getStatusBannerClass(
          device.repairState
        )}`}
      >
        {device.repairState === 'ACTIVE_REPAIR' && (
          <RefreshCw size={18} color="#00236f" />
        )}
        {device.repairState === 'NO_REPAIRS' && (
          <CheckCircle size={18} color="#00455f" />
        )}
        {device.repairState === 'PENDING_REQUEST' && (
          <Clock size={18} color="#b45309" />
        )}
        <Text
          className={`text-[11px] font-semibold flex-1 ${getStatusTextClass(
            device.repairState
          )}`}
          numberOfLines={1}
        >
          {device.repairState === 'ACTIVE_REPAIR' ? 'Active repair' : device.repairState === 'PENDING_REQUEST' ? 'Repair request pending' : 'No active repairs'}
        </Text>
      </View>

      <View className="flex-row gap-2 mt-1 pt-1">
        <TouchableOpacity
          onPress={() => onViewDetails(device)}
          activeOpacity={0.8}
          className="flex-1 min-h-[48px] rounded-lg bg-surface-container-high flex-row items-center justify-center gap-1"
          accessibilityRole="button"
          accessibilityLabel={`View details for ${name}`}
        >
          <Info size={18} color="#131b2e" />
          <Text className="text-xs font-semibold text-on-surface">
            View Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onPrimaryAction(device)}
          activeOpacity={0.8}
          className={`flex-1 min-h-[48px] rounded-lg flex-row items-center justify-center gap-1 shadow-sm ${primaryAction.buttonClass}`}
          accessibilityRole="button"
          accessibilityLabel={`${primaryAction.label} for ${name}`}
        >
          {primaryAction.icon}
          <Text className={`text-xs font-semibold ${primaryAction.textClass}`}>
            {primaryAction.label}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};