import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { PlusCircle } from 'lucide-react-native';

interface RegisterDeviceButtonProps {
  onPress: () => void;
}

export const RegisterDeviceButton: React.FC<RegisterDeviceButtonProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="w-full h-12 rounded-lg bg-primary flex-row items-center justify-center gap-1.5 shadow-sm"
      accessibilityRole="button"
      accessibilityLabel="Register a new device"
    >
      <PlusCircle size={20} color="#ffffff" strokeWidth={2.2} />
      <Text className="text-sm font-semibold text-on-primary">
        Register New Device
      </Text>
    </TouchableOpacity>
  );
};
