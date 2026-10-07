export type NotificationChannel = {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
};

export type ProfileStats = {
  registeredDevices: number;
  activeRepairs: number;
  completedRepairs: number;
};

export type PrimaryRepairHub = {
  id: string;
  name: string;
  address: string;
  benchHours: string;
};

export type ProfileData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  isVerified: boolean;
  memberSince: string;
  stats: ProfileStats;
  primaryHub: PrimaryRepairHub;
  notificationChannels: NotificationChannel[];
};

export type EditProfileInput = {
  name: string;
  phone: string;
  email: string;
};
