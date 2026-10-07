import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { CustomerDevice } from '../types';

interface DeviceActionsMenuProps {
  device: CustomerDevice | null;
  onClose: () => void;
  onEdit: (device: CustomerDevice) => void;
  onRemove: (device: CustomerDevice) => void;
}

export const DeviceActionsMenu: React.FC<DeviceActionsMenuProps> = ({
  device,
  onClose,
  onEdit,
  onRemove,
}) => {
  return (
    <Modal
      visible={device !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-inverse-surface/40 justify-end"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss device actions"
      >
        {device ? (
          <Pressable
            className="bg-surface-container-lowest rounded-t-2xl px-4 pt-3 pb-8"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="w-12 h-1.5 rounded-full bg-outline-variant self-center mb-4" />
            <Text className="text-base font-semibold text-on-surface mb-2 px-1">
              {device.name}
            </Text>
            <TouchableOpacity
              onPress={() => onEdit(device)}
              activeOpacity={0.8}
              className="w-full min-h-[48px] px-4 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel={`Edit details for ${device.name}`}
            >
              <Pencil size={18} color="#131b2e" />
              <Text className="text-sm font-semibold text-on-surface">
                Edit Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRemove(device)}
              activeOpacity={0.8}
              className="w-full min-h-[48px] px-4 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel={`Remove ${device.name}`}
            >
              <Trash2 size={18} color="#ba1a1a" />
              <Text className="text-sm font-semibold text-error">
                Remove Device
              </Text>
            </TouchableOpacity>
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
};
