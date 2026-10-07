import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Badge,
  Lock,
  FileText,
  PhoneCall,
  MessageCircle,
  Terminal,
} from "lucide-react-native";

import {
  ProfileHeaderCard,
  ProfileStatsRow,
  ProfileMenuSection,
  ProfileMenuItem,
  PrimaryHubItem,
  NotificationChannelsItem,
  LogoutSection,
  EditProfileSheet,
  useProfile,
} from "../../features/profile";
import { HomeHeader } from "../../features/home";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    name,
    email,
    phone,
    initials,
    memberSince,
    isVerified,
    stats,
    primaryHub,
    notificationChannels,
    isRefreshing,
    isEditSheetVisible,
    isLogoutModalVisible,
    isSigningOut,
    refreshProfile,
    openEditSheet,
    closeEditSheet,
    saveProfile,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  } = useProfile();

  const handleNotificationsPress = () => {
    router.push("/(app)/AlertScreen");
  };

  const handleProfilePress = () => {
    // Already on Profile screen
  };

  const handleDevicesPress = () => {
    router.push("/(app)/DeviceScreen");
  };

  const handleRepairsPress = () => {
    // Navigate to repairs when route is available
  };

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Top Header */}
      <HomeHeader
        hasUnreadNotifications={stats.activeRepairs > 0}
        onNotificationsPress={handleNotificationsPress}
        onProfilePress={handleProfilePress}
      />

      {/* Scrollable Profile Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshProfile}
            colors={["#00236f", "#0051d5"]}
            tintColor="#0051d5"
          />
        }
      >
        <View className="gap-5">
          {/* Profile Header Card */}
          <ProfileHeaderCard
            profile={{ name, email, phone, initials, isVerified, memberSince }}
            onEditPress={openEditSheet}
          />

          {/* Quick Stats Row */}
          <ProfileStatsRow
            stats={stats}
            onDevicesPress={handleDevicesPress}
            onRepairsPress={handleRepairsPress}
          />

          {/* Account & Preferences */}
          <ProfileMenuSection title="Account & Preferences">
            <ProfileMenuItem
              icon={Badge}
              label="Personal Information"
              description="Edit identity, phone, and contact email"
              onPress={openEditSheet}
            />
            <PrimaryHubItem hub={primaryHub} />
            <NotificationChannelsItem channels={notificationChannels} />
          </ProfileMenuSection>

          {/* Security & Verification */}
          <ProfileMenuSection title="Security & Verification">
            <ProfileMenuItem
              icon={Lock}
              label="Password & Authentication"
              description="Last changed 2 months ago"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon={FileText}
              label="Email Verification"
              description="Primary login identity"
              rightElement={
                <View className="px-2.5 py-1 rounded-full bg-secondary-fixed flex-row items-center gap-1">
                  <Text className="text-on-surface-variant text-xs font-semibold">
                    Verified
                  </Text>
                </View>
              }
            />
          </ProfileMenuSection>

          {/* Support & Legal */}
          <ProfileMenuSection title="Support & Legal">
            <ProfileMenuItem
              icon={FileText}
              label="Service Guarantee & Terms"
              description="Laboratory parts & rework coverage terms"
              onPress={() => {}}
            />
            <View className="px-4 py-3.5">
              <ProfileMenuItem
                icon={PhoneCall}
                label="Support Center"
                description="Live hardware bench concierge"
              />
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="flex-1 min-h-[48px] bg-surface-container rounded-lg flex-row items-center justify-center gap-2"
                  accessibilityRole="button"
                  accessibilityLabel="Call support hotline"
                >
                  <PhoneCall size={16} color="#00236f" />
                  <Text className="text-primary text-xs font-semibold">
                    Call Hotline
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="flex-1 min-h-[48px] bg-secondary rounded-lg flex-row items-center justify-center gap-2 shadow-sm"
                  accessibilityRole="button"
                  accessibilityLabel="Send message to support"
                >
                  <MessageCircle size={16} color="#ffffff" />
                  <Text className="text-on-secondary text-xs font-semibold">
                    Send Message
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ProfileMenuSection>

          {/* App version metadata */}
          <View className="items-center py-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <Terminal size={12} color="#757682" />
              <Text className="text-outline text-xs font-bold tracking-wider">
                FanniTech Mobile V1.0.0
              </Text>
            </View>
            <Text className="text-on-surface-variant text-xs">
              Surgical Hardware Tracking & Diagnostics Engine
            </Text>
          </View>

          {/* Danger Zone */}
          <LogoutSection
            isModalVisible={isLogoutModalVisible}
            isSigningOut={isSigningOut}
            onLogoutPress={openLogoutModal}
            onConfirm={confirmLogout}
            onCancel={closeLogoutModal}
          />

          {/* Delete Account link */}
          <View className="items-center pb-2">
            <TouchableOpacity
              activeOpacity={0.7}
              className="py-2 px-4"
              accessibilityRole="button"
              accessibilityLabel="Delete customer account"
            >
              <Text className="text-error/80 text-xs font-semibold underline underline-offset-4">
                Delete Customer Account & Erase Diagnostic History
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Bottom Sheet */}
      <EditProfileSheet
        visible={isEditSheetVisible}
        initialName={name}
        initialEmail={email}
        initialPhone={phone}
        onSave={saveProfile}
        onClose={closeEditSheet}
      />
    </SafeAreaView>
  );
}
