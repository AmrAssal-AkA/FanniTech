import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon: Icon,
  label,
  description,
  onPress,
  rightElement,
  disabled = false,
}) => {
  const content = (
    <View className="flex-row items-center justify-between px-4 py-3.5 min-h-[56px]">
      <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-3">
        <View className="w-10 h-10 rounded-lg bg-surface-container items-center justify-center">
          <Icon size={20} color="#00236f" />
        </View>
        <View className="flex-col flex-1 min-w-0">
          <Text className="text-on-surface text-sm font-semibold" numberOfLines={1}>
            {label}
          </Text>
          {description ? (
            <Text
              className="text-on-surface-variant text-xs mt-0.5"
              numberOfLines={1}
            >
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      {rightElement ?? (
        <ChevronRight size={20} color="#757682" />
      )}
    </View>
  );

  if (!onPress || disabled) {
    return <View>{content}</View>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </TouchableOpacity>
  );
};

