import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  AlertHeader,
  AlertFilterTabs,
  AlertSectionGroup,
  AllCaughtUp,
  useAlerts,
  AlertItem,
} from "../../features/alerts";
import { HomeHeader } from "../../features/home";

export default function AlertScreen() {
  const router = useRouter();
  const {
    todayAlerts,
    earlierAlerts,
    unreadCount,
    counts,
    activeFilter,
    setActiveFilter,
    isRefreshing,
    refreshAlerts,
    markAllAsRead,
    markAsRead,
  } = useAlerts();

  const handleNotificationsPress = () => {
    // Already on Alerts screen
  };

  const handleProfilePress = () => {
    // Navigate to profile when route is available
  };

  const handleAlertPress = (alert: AlertItem) => {
    if (alert.isUnread) {
      markAsRead(alert.id);
    }
  };

  const handleActionPress = (alert: AlertItem) => {
    if (alert.isUnread) {
      markAsRead(alert.id);
    }

    if (alert.action?.type === "ticket") {
      router.push({
        pathname: "/(app)/RepairTicketScreen",
        params: {
          ticketNumber: alert.action.target || alert.referenceId || "SR-1001",
        },
      });
    } else if (alert.action?.type === "info") {
      Alert.alert("Drop-off Information", alert.action.infoDetails || "");
    }
  };

  const activeTodayCount = todayAlerts.filter((a) => a.isUnread).length;

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Top Navigation Bar with FanniTech Customer Lab branding */}
      <HomeHeader
        hasUnreadNotifications={unreadCount > 0}
        onNotificationsPress={handleNotificationsPress}
        onProfilePress={handleProfilePress}
      />

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 112 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshAlerts}
            colors={["#00236f", "#0051d5"]}
            tintColor="#0051d5"
          />
        }
      >
        {/* Title, Unread Counter & Mark All Read */}
        <AlertHeader unreadCount={unreadCount} onMarkAllRead={markAllAsRead} />

        {/* Filter Category Tabs */}
        <AlertFilterTabs
          activeFilter={activeFilter}
          counts={counts}
          onSelectFilter={setActiveFilter}
        />

        {/* Alerts List by Section */}
        <View className="px-4 mt-2 flex-col gap-5">
          {/* Today Section */}
          <AlertSectionGroup
            title="Today"
            badge={
              activeTodayCount > 0
                ? `${activeTodayCount} Active Updates`
                : undefined
            }
            alerts={todayAlerts}
            onAlertPress={handleAlertPress}
            onActionPress={handleActionPress}
          />

          {/* Earlier This Week Section */}
          <AlertSectionGroup
            title="Earlier This Week"
            alerts={earlierAlerts}
            onAlertPress={handleAlertPress}
            onActionPress={handleActionPress}
          />
        </View>

        {/* All Caught Up Status Micro-Card */}
        <AllCaughtUp isFiltered={activeFilter !== "all"} />
      </ScrollView>
    </SafeAreaView>
  );
}
