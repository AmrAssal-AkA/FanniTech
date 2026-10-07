import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Laptop,
  Monitor,
  X,
  History,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { CustomerDevice } from '../types';

interface DeviceDetailsSheetProps {
  device: CustomerDevice | null;
  onClose: () => void;
  onEdit: (device: CustomerDevice) => void;
  onRemove: (device: CustomerDevice) => void;
}

export const DeviceDetailsSheet: React.FC<DeviceDetailsSheetProps> = ({
  device,
  onClose,
  onEdit,
  onRemove,
}) => {
  return (
    <Modal
      visible={device !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-inverse-surface/40 justify-end"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss device details"
      >
        {device ? (
          <Pressable
            className="bg-surface-container-lowest rounded-t-2xl p-6 gap-4"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="w-12 h-1.5 rounded-full bg-outline-variant self-center" />
            <View className="flex-row items-center justify-between mt-1">
              <View className="flex-row items-center gap-2 flex-1 min-w-0">
                <View className="w-9 h-9 rounded-lg bg-surface-container items-center justify-center">
                  {device.category === 'Desktop' ? (
                    <Monitor size={20} color="#00236f" />
                  ) : (
                    <Laptop size={20} color="#00236f" />
                  )}
                </View>
                <View className="flex-1 min-w-0">
                  <Text
                    className="text-lg font-bold text-on-surface"
                    numberOfLines={1}
                  >
                    {device.name}
                  </Text>
                  <Text className="text-[11px] font-semibold text-outline">
                    {device.category} System
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="w-11 h-11 rounded-full items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Close device details"
              >
                <X size={20} color="#444651" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap bg-surface-container-low p-4 rounded-xl">
              <View className="w-1/2 pr-2">
                <Text className="text-[11px] font-semibold text-outline">
                  Brand
                </Text>
                <Text className="text-sm font-semibold text-on-surface">
                  {device.brand}
                </Text>
              </View>
              <View className="w-1/2 pl-2">
                <Text className="text-[11px] font-semibold text-outline">
                  Model
                </Text>
                <Text
                  className="text-sm font-semibold text-on-surface"
                  numberOfLines={1}
                >
                  {device.model}
                </Text>
              </View>
              <View className="w-1/2 pr-2 mt-2">
                <Text className="text-[11px] font-semibold text-outline">
                  Serial Number
                </Text>
                <Text className="text-[13px] font-bold text-primary tracking-wide">
                  {device.serialNumber}
                </Text>
              </View>
              <View className="w-1/2 pl-2 mt-2">
                <Text className="text-[11px] font-semibold text-outline">
                  Added Date
                </Text>
                <Text className="text-sm font-semibold text-on-surface">
                  {device.addedDate}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between p-2 px-4 rounded-xl bg-surface-container">
              <View className="flex-row items-center gap-2">
                <History size={22} color="#00236f" />
                <Text className="text-xs font-medium text-on-surface">
                  Service Record
                </Text>
              </View>
              <Text className="text-xs font-bold text-primary">
                {device.serviceRecordLabel}
              </Text>
            </View>

            <View className="flex-row items-center gap-2 pt-1">
              <TouchableOpacity
                onPress={() => onEdit(device)}
                activeOpacity={0.8}
                className="flex-1 min-h-[48px] rounded-lg bg-surface-container-high flex-row items-center justify-center gap-2"
                accessibilityRole="button"
                accessibilityLabel={`Edit details for ${device.name}`}
              >
                <Pencil size={18} color="#131b2e" />
                <Text className="text-xs font-semibold text-on-surface">
                  Edit Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onRemove(device)}
                activeOpacity={0.8}
                className="min-h-[48px] px-4 rounded-lg bg-error-container flex-row items-center justify-center gap-1"
                accessibilityRole="button"
                accessibilityLabel={`Remove ${device.name}`}
              >
                <Trash2 size={18} color="#93000a" />
                <Text className="text-xs font-semibold text-on-error-container">
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
};
