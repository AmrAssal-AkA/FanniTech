import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { HomeHeader } from '../../features/home';
import {
  CustomerDevice,
  DeviceActionsMenu,
  DeviceCard,
  DeviceDetailsSheet,
  DevicesEmptyState,
  DevicesErrorState,
  DevicesHeader,
  RegisterDeviceButton,
  useDevices,
} from '../../features/devices';

export default function DeviceScreen() {
  const router = useRouter();
  const {
    devices,
    registeredCount,
    selectedDevice,
    menuDevice,
    isRefreshing,
    isLoading,
    error,
    refreshDevices,
    openDeviceDetails,
    closeDeviceDetails,
    openDeviceMenu,
    closeDeviceMenu,
    removeDevice,
  } = useDevices();

  const handleNotificationsPress = () => {
    router.push('/(app)/AlertScreen');
  };

  const handleProfilePress = () => {
    // Navigate to profile when route is available
  };

  const handleRegisterDevice = () => {
    Alert.alert(
      'Register Device',
      'Device registration will open when the add-device flow is available.'
    );
  };

  const handlePrimaryAction = (device: CustomerDevice) => {
    if (device.repairState === 'ACTIVE_REPAIR') {
      Alert.alert(
        'Track Repair',
        `Opening ticket #${device.activeTicketNumber ?? 'active'} for ${device.name}.`
      );
      return;
    }

    if (device.repairState === 'PENDING_REQUEST') {
      Alert.alert(
        'Repair Request',
        `Opening request #${device.pendingRequestNumber ?? 'pending'} for ${device.name}.`
      );
      return;
    }

    Alert.alert(
      'Request Repair',
      `Create a repair request for ${device.name} when the request flow is available.`
    );
  };

  const handleEditDevice = (device: CustomerDevice) => {
    closeDeviceMenu();
    closeDeviceDetails();
    Alert.alert(
      'Edit Details',
      `Device editor for ${device.name} will open when that flow is available.`
    );
  };

  const handleRemoveDevice = (device: CustomerDevice) => {
    closeDeviceMenu();
    closeDeviceDetails();
    Alert.alert(
      'Remove Device',
      `De-register ${device.name} from your FanniTech account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeDevice(device.id),
        },
      ]
    );
  };

  const renderDevice: ListRenderItem<CustomerDevice> = ({ item }) => (
    <DeviceCard
      device={item}
      onViewDetails={openDeviceDetails}
      onPrimaryAction={handlePrimaryAction}
      onOpenMenu={openDeviceMenu}
    />
  );

  const listHeader = (
    <View className="gap-4 mb-4">
      <DevicesHeader registeredCount={registeredCount} />
      <RegisterDeviceButton onPress={handleRegisterDevice} />
    </View>
  );

  const listEmpty = error ? (
    <DevicesErrorState
      message="Please check your connection and try again."
      onRetry={refreshDevices}
    />
  ) : (
    <DevicesEmptyState />
  );

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      <HomeHeader
        hasUnreadNotifications={true}
        onNotificationsPress={handleNotificationsPress}
        onProfilePress={handleProfilePress}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0051d5" />
        </View>
      ) : (
        <FlatList
          data={error ? [] : devices}
          keyExtractor={(item) => item.id}
          renderItem={renderDevice}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 112, paddingTop: 16 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshDevices}
              colors={['#00236f', '#0051d5']}
              tintColor="#0051d5"
            />
          }
        />
      )}

      <DeviceActionsMenu
        device={menuDevice}
        onClose={closeDeviceMenu}
        onEdit={handleEditDevice}
        onRemove={handleRemoveDevice}
      />

      <DeviceDetailsSheet
        device={selectedDevice}
        onClose={closeDeviceDetails}
        onEdit={handleEditDevice}
        onRemove={handleRemoveDevice}
      />
    </SafeAreaView>
  );
}
