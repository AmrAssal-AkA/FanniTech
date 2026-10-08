import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FanniTechLogo } from './FanniTechLogo';

interface AuthHeaderProps {
  title: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title }) => {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View className="h-16 w-full flex-row items-center justify-between border-b border-slate-100 bg-surface/90 px-4">
      <View className="flex-row items-center gap-1">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          className="-ml-2 h-11 w-11 items-center justify-center rounded-full active:bg-surface-container"
          accessibilityRole="button"
          accessibilityLabel="Go Back"
        >
          <ArrowLeft size={22} color="#131b2e" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold tracking-tight text-on-surface">
          {title}
        </Text>
      </View>

      <View className="items-center justify-center">
        <Image source={require('../../../assets/icon.png')} className="h-8 w-8" />
      </View>
    </View>
  );
};

export default AuthHeader;
