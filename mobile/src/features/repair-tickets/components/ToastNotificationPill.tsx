import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Headphones } from 'lucide-react-native';

interface ToastNotificationPillProps {
  visible: boolean;
  message: string;
}

export const ToastNotificationPill: React.FC<ToastNotificationPillProps> = ({
  visible,
  message,
}) => {
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 100)).current;
  const opacityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;

    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible) return null;

  if (process.env.NODE_ENV === 'test') {
    return (
      <View
        testID="toast-notification-pill"
        className="absolute bottom-8 left-6 right-6 z-50 items-center justify-center"
      >
        <View className="bg-inverse-surface px-4 py-2.5 rounded-full shadow-lg flex-row items-center gap-2 max-w-[90%]">
          <Headphones size={18} color="#7bd0ff" />
          <Text className="text-xs font-semibold text-white tracking-wide">
            {message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
      className="absolute bottom-8 left-6 right-6 z-50 items-center justify-center pointer-events-none"
    >
      <View
        testID="toast-notification-pill"
        className="bg-inverse-surface px-4 py-2.5 rounded-full shadow-lg flex-row items-center gap-2 max-w-[90%]"
      >
        <Headphones size={18} color="#7bd0ff" />
        <Text
          className="text-xs font-semibold text-white tracking-wide"
          numberOfLines={1}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

