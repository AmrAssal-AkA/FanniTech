import { useState, useCallback, useMemo } from 'react';
import { EditProfileInput, NotificationChannel, PrimaryRepairHub, ProfileStats } from '../types';
import { useAuthSession } from '../../auth/session/AuthSession';

const INITIAL_STATS: ProfileStats = {
  registeredDevices: 3,
  activeRepairs: 1,
  completedRepairs: 4,
};

const INITIAL_HUB: PrimaryRepairHub = {
  id: 'HUB-RUH-01',
  name: 'FanniTech Central Hub',
  address: 'Al-Olaya St, Riyadh 12211, Kingdom of Saudi Arabia',
  benchHours: '08:00 - 22:00',
};

const INITIAL_CHANNELS: NotificationChannel[] = [
  {
    id: 'sms',
    label: 'SMS Critical Bench Alerts',
    description: 'Urgent repair status updates via SMS',
    isActive: true,
  },
  {
    id: 'email',
    label: 'Diagnostic PDF Summaries',
    description: 'Repair diagnosis reports delivered by email',
    isActive: true,
  },
  {
    id: 'push',
    label: 'Telemetry Push Pings',
    description: 'Real-time push notifications for status changes',
    isActive: true,
  },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function useProfile() {
  const { user, signOut } = useAuthSession();

  const [stats] = useState<ProfileStats>(INITIAL_STATS);
  const [primaryHub] = useState<PrimaryRepairHub>(INITIAL_HUB);
  const [notificationChannels] = useState<NotificationChannel[]>(INITIAL_CHANNELS);

  const [overrideName, setOverrideName] = useState<string | null>(null);
  const [overrideEmail, setOverrideEmail] = useState<string | null>(null);
  const [overridePhone, setOverridePhone] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const name = overrideName ?? user?.name ?? '';
  const email = overrideEmail ?? user?.email ?? '';
  const phone = overridePhone ?? user?.phone ?? '';
  const initials = useMemo(() => getInitials(name), [name]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return '';
    const date = new Date(user.createdAt);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }, [user?.createdAt]);

  const refreshProfile = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    setIsRefreshing(false);
  }, []);

  const openEditSheet = useCallback(() => {
    setIsEditSheetVisible(true);
  }, []);

  const closeEditSheet = useCallback(() => {
    setIsEditSheetVisible(false);
  }, []);

  const saveProfile = useCallback((input: EditProfileInput) => {
    setOverrideName(input.name.trim());
    setOverrideEmail(input.email.trim());
    setOverridePhone(input.phone.trim());
    setIsEditSheetVisible(false);
  }, []);

  const openLogoutModal = useCallback(() => {
    setIsLogoutModalVisible(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalVisible(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsLogoutModalVisible(false);
    }
  }, [signOut]);

  return {
    name,
    email,
    phone,
    initials,
    memberSince,
    isVerified: !!user,
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
  };
}
