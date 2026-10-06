import React from 'react';
import { Text, View } from 'react-native';

const HomeScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-xl font-semibold text-slate-900">FanniTech</Text>
      <View className="mt-2">
        <Text className="text-center text-base text-slate-700">
          Welcome to FanniTech! This is the home screen of your app.
        </Text>
      </View>
    </View>
  );
};

export default HomeScreen;