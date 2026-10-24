import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { LogOut } from 'lucide-react-native';

interface LogoutSectionProps {
  isModalVisible: boolean;
  isSigningOut: boolean;
  onLogoutPress: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutSection: React.FC<LogoutSectionProps> = ({
  isModalVisible,
  isSigningOut,
  onLogoutPress,
  onConfirm,
  onCancel,
}) => {
  return (
    <>
      {/* Log Out button */}
      <TouchableOpacity
        onPress={onLogoutPress}
        activeOpacity={0.8}
        className="w-full min-h-[52px] bg-error-container rounded-xl flex-row items-center justify-center gap-2 shadow-sm"
        accessibilityRole="button"
        accessibilityLabel="Log out of FanniTech"
      >
        <LogOut size={20} color="#93000a" />
        <Text className="text-on-error-container text-sm font-bold">
          Log Out
        </Text>
      </TouchableOpacity>

      {/* Confirmation modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
        statusBarTranslucent
      >
        <View className="flex-1 bg-on-surface/40 items-center justify-center px-6">
          <View className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 gap-5 shadow-xl">
            {/* Icon */}
            <View className="w-14 h-14 rounded-full bg-error-container items-center justify-center self-center">
              <LogOut size={24} color="#93000a" />
            </View>

            {/* Copy */}
            <View className="gap-1.5 items-center">
              <Text className="text-on-surface text-lg font-bold text-center">
                Log out of FanniTech?
              </Text>
              <Text className="text-on-surface-variant text-sm text-center leading-relaxed">
                You'll need to sign in again to view your bench diagnostic progress.
              </Text>
            </View>

            {/* Actions */}
            <View className="gap-2 pt-1">
              <TouchableOpacity
                onPress={onConfirm}
                disabled={isSigningOut}
                activeOpacity={0.8}
                className="w-full min-h-[52px] bg-error rounded-xl items-center justify-center flex-row gap-2"
                accessibilityRole="button"
                accessibilityLabel="Confirm log out"
              >
                {isSigningOut ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-on-error text-sm font-bold">
                    Yes, Log Out
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onCancel}
                disabled={isSigningOut}
                activeOpacity={0.8}
                className="w-full min-h-[52px] bg-surface-container rounded-xl items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Cancel log out"
              >
                <Text className="text-on-surface text-sm font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

