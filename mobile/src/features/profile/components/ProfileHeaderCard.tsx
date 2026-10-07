import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Edit2, Mail, Smartphone, CheckCircle2 } from 'lucide-react-native';
import { ProfileData } from '../types';

interface ProfileHeaderCardProps {
  profile: Pick<ProfileData, 'name' | 'email' | 'phone' | 'initials' | 'isVerified' | 'memberSince'>;
  onEditPress: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  onEditPress,
}) => {
  return (
    <View className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-4">
      {/* Avatar + Name row */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3">
          {/* Avatar with initials */}
          <View className="relative">
            <View className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-sm">
              {profile.initials ? (
                <Text className="text-on-primary text-xl font-bold">
                  {profile.initials}
                </Text>
              ) : (
                <User size={24} color="#ffffff" />
              )}
            </View>
            {profile.isVerified && (
              <View className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary items-center justify-center shadow-sm">
                <CheckCircle2 size={10} color="#ffffff" strokeWidth={3} />
              </View>
            )}
          </View>

          {/* Name + badge */}
          <View className="flex-col min-w-0">
            <Text
              className="text-on-surface text-base font-bold tracking-tight"
              numberOfLines={1}
            >
              {profile.name}
            </Text>
            {profile.isVerified && (
              <View className="flex-row items-center gap-1 mt-0.5">
                <View className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <Text className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  Verified Customer • {profile.memberSince}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit button */}
        <TouchableOpacity
          onPress={onEditPress}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-surface-container items-center justify-center"
          accessibilityLabel="Edit profile"
          accessibilityRole="button"
        >
          <Edit2 size={18} color="#00236f" />
        </TouchableOpacity>
      </View>

      {/* Contact info */}
      <View className="mt-4 bg-surface-container-low rounded-lg px-3 py-2.5 gap-2">
        <View className="flex-row items-center gap-2">
          <Mail size={16} color="#0051d5" />
          <Text className="text-on-surface-variant text-xs flex-1" numberOfLines={1}>
            {profile.email}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Smartphone size={16} color="#0051d5" />
          <Text className="text-on-surface-variant text-xs tracking-wide">
            {profile.phone}
          </Text>
        </View>
      </View>
    </View>
  );
};
