import React from 'react';
import { View, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  HomeHeader,
  LabStatusHeader,
  ActiveRepairCard,
  QuickActionButtons,
  RegisteredDevicesSection,
  RecentActivitySection,
  LaboratoryStandardsCard,
  useHomeData,
} from '../../features/home';
import { useNotificationStore } from '../../stores/notificationStore';

export default function HomeScreen() {
  const router = useRouter();
  const { unreadCount } = useNotificationStore();
  const {
    userName,
    isLabOnline,
    labHoursText,
    activeTicket,
    devices,
    activities,
    isRefreshing,
    refreshHomeData,
  } = useHomeData();

  const handleNotificationsPress = () => {
    router.push('/(app)/AlertScreen');
  };

  const handleProfilePress = () => {
    router.push('/(app)/ProfileScreen');
  };

  const handleTicketDetails = (_ticketId: string) => {
    // Navigate to ticket detail view (#SR-1001)
  };

  const handleSubmitRepair = () => {
    // Navigate to create repair request flow
  };

  const handleAddNewDevice = () => {
    // Navigate to add new device flow
  };

  const handleViewAllDevices = () => {
    router.push('/(app)/DeviceScreen');
  };

  const handleSelectDevice = (_deviceId: string) => {
    // Navigate to specific device detail
  };

  const handleSelectActivity = (_activityId: string) => {
    // Navigate to repair request detail
  };

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Top Header Bar */}
      <HomeHeader
        hasUnreadNotifications={unreadCount > 0}
        onNotificationsPress={handleNotificationsPress}
        onProfilePress={handleProfilePress}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 112, paddingTop: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshHomeData}
            colors={['#00236f', '#0051d5']}
            tintColor="#0051d5"
          />
        }
      >
        <View className="space-y-5">
          {/* Top Greeting & Lab Status */}
          <LabStatusHeader
            userName={userName}
            isLabOnline={isLabOnline}
            labHoursText={labHoursText}
          />

          {/* Active Repair Hero Card */}
          {activeTicket && (
            <ActiveRepairCard
              ticket={activeTicket}
              onPressDetails={handleTicketDetails}
            />
          )}

          {/* Quick Action Row */}
          <QuickActionButtons
            onSubmitRepair={handleSubmitRepair}
            onAddNewDevice={handleAddNewDevice}
          />

          {/* Registered Devices */}
          <RegisteredDevicesSection
            devices={devices}
            onViewAll={handleViewAllDevices}
            onSelectDevice={handleSelectDevice}
          />

          {/* Recent Requests & Activity */}
          <RecentActivitySection
            activities={activities}
            onSelectActivity={handleSelectActivity}
          />

          {/* Benchwork Precision Assurance Micro-Card */}
          <LaboratoryStandardsCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
