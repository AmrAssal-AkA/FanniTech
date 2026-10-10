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
  DeviceWithRepairState,
  DeviceActionsMenu,
  DeviceCard,
  DeviceDetailsSheet,
  DevicesEmptyState,
  DevicesErrorState,
  DevicesHeader,
  RegisterDeviceButton,
  RegisterDeviceSheet,
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
  } = useDevices();
  const [isRegisterSheetVisible, setRegisterSheetVisible] = React.useState(false);

  const handleNotificationsPress = () => {
    router.push('/(app)/AlertScreen');
  };

  const handleProfilePress = () => {
    // Navigate to profile when route is available
  };

  const handleRegisterDevice = () => {
    setRegisterSheetVisible(true);
  };

  const handlePrimaryAction = (device: DeviceWithRepairState) => {
    const deviceName = `${device.brand} ${device.model}`;
    if (device.repairState === 'ACTIVE_REPAIR') {
      router.push('/(app)/RepairRequestsListScreen' as never);
      return;
    }

    if (device.repairState === 'PENDING_REQUEST') {
      router.push('/(app)/RepairRequestsListScreen' as never);
      return;
    }

    router.push({ pathname: '/(app)/RepairRequestScreen', params: { deviceId: device.id, deviceName } } as never);
  };

  const handleEditDevice = (device: DeviceWithRepairState) => {
    closeDeviceMenu();
    closeDeviceDetails();
    Alert.alert(
      'Edit Details',
      `Device editor for ${device.brand} ${device.model} will open when that flow is available.`
    );
  };

  const handleRemoveDevice = (device: DeviceWithRepairState) => {
    closeDeviceMenu();
    closeDeviceDetails();
    Alert.alert(
      'Remove Device',
      `${device.brand} ${device.model} cannot be removed yet because the backend does not expose a deletion endpoint.`,
    );
  };

  const renderDevice: ListRenderItem<DeviceWithRepairState> = ({ item }) => (
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
      <RegisterDeviceSheet visible={isRegisterSheetVisible} onClose={() => setRegisterSheetVisible(false)} />
    </SafeAreaView>
  );
}
