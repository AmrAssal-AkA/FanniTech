import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PlusCircle, Laptop } from 'lucide-react-native';

interface QuickActionButtonsProps {
  onSubmitRepair?: () => void;
  onAddNewDevice?: () => void;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onSubmitRepair,
  onAddNewDevice,
}) => {
  return (
    <View className="flex-row items-center gap-3">
      {/* Submit Repair button */}
      <TouchableOpacity
        onPress={onSubmitRepair}
        activeOpacity={0.8}
        className="flex-1 h-12 px-3 bg-secondary rounded-xl flex-row items-center justify-center gap-2 shadow-xs"
        accessibilityLabel="Submit a new repair request"
        accessibilityRole="button"
      >
        <PlusCircle size={18} color="#ffffff" strokeWidth={2.2} />
        <Text className="text-xs font-bold text-on-secondary">Submit Repair</Text>
      </TouchableOpacity>

      {/* Add New Device button */}
      <TouchableOpacity
        onPress={onAddNewDevice}
        activeOpacity={0.8}
        className="flex-1 h-12 px-3 bg-surface-container rounded-xl flex-row items-center justify-center gap-2 border border-surface-container-high/60 shadow-xs"
        accessibilityLabel="Add a new registered device"
        accessibilityRole="button"
      >
        <Laptop size={18} color="#00236f" strokeWidth={2} />
        <Text className="text-xs font-bold text-primary">Add New Device</Text>
      </TouchableOpacity>
    </View>
  );
};
