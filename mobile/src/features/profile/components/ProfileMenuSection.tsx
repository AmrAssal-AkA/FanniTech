import React from 'react';
import { View, Text } from 'react-native';

interface ProfileMenuSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ProfileMenuSection: React.FC<ProfileMenuSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View className="gap-1">
      <Text className="text-outline text-xs font-semibold uppercase tracking-wider px-1 mb-1">
        {title}
      </Text>
      <View className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden divide-y divide-surface-container-low">
        {children}
      </View>
    </View>
  );
};

