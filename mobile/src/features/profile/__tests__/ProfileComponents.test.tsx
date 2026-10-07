import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  ProfileHeaderCard,
  ProfileStatsRow,
  ProfileMenuSection,
  PrimaryHubItem,
  NotificationChannelsItem,
  LogoutSection,
} from '../components';
import { ProfileStats, PrimaryRepairHub, NotificationChannel } from '../types';

const mockProfile = {
  name: 'Sarah Ahmed',
  email: 'sarah.ahmed@domain.com',
  phone: '+966 50 123 4567',
  initials: 'SA',
  isVerified: true,
  memberSince: 'Oct 2023',
};

const mockStats: ProfileStats = {
  registeredDevices: 3,
  activeRepairs: 1,
  completedRepairs: 4,
};

const mockHub: PrimaryRepairHub = {
  id: 'HUB-RUH-01',
  name: 'FanniTech Central Hub',
  address: 'Al-Olaya St, Riyadh 12211',
  benchHours: '08:00 - 22:00',
};

const mockChannels: NotificationChannel[] = [
  { id: 'sms', label: 'SMS Critical Bench Alerts', description: '', isActive: true },
  { id: 'email', label: 'Diagnostic PDF Summaries', description: '', isActive: true },
  { id: 'push', label: 'Telemetry Push Pings', description: '', isActive: false },
];

describe('Profile Screen Components', () => {
  it('renders ProfileHeaderCard with name, email, phone and verified badge', async () => {
    const onEdit = jest.fn();
    await render(
      <ProfileHeaderCard profile={mockProfile} onEditPress={onEdit} />
    );

    expect(screen.getByText('Sarah Ahmed')).toBeTruthy();
    expect(screen.getByText('sarah.ahmed@domain.com')).toBeTruthy();
    expect(screen.getByText('+966 50 123 4567')).toBeTruthy();
    expect(screen.getByText(/Verified Customer/)).toBeTruthy();
  });

  it('calls onEditPress when edit button is pressed in ProfileHeaderCard', async () => {
    const onEdit = jest.fn();
    await render(
      <ProfileHeaderCard profile={mockProfile} onEditPress={onEdit} />
    );

    fireEvent.press(screen.getByLabelText('Edit profile'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders ProfileStatsRow with correct stat counts', async () => {
    const onDevices = jest.fn();
    const onRepairs = jest.fn();
    await render(
      <ProfileStatsRow
        stats={mockStats}
        onDevicesPress={onDevices}
        onRepairsPress={onRepairs}
      />
    );

    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('3 registered devices'));
    expect(onDevices).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByLabelText('1 active repairs'));
    expect(onRepairs).toHaveBeenCalledTimes(1);
  });

  it('renders ProfileMenuSection with its title', async () => {
    await render(
      <ProfileMenuSection title="Account & Preferences">
        <></>
      </ProfileMenuSection>
    );
    expect(screen.getByText('Account & Preferences')).toBeTruthy();
  });

  it('renders PrimaryHubItem with hub details', async () => {
    await render(<PrimaryHubItem hub={mockHub} />);

    expect(screen.getByText('FanniTech Central Hub')).toBeTruthy();
    expect(screen.getByText('Al-Olaya St, Riyadh 12211')).toBeTruthy();
    expect(screen.getByText('HUB-RUH-01')).toBeTruthy();
    expect(screen.getByText(/08:00 - 22:00/)).toBeTruthy();
  });

  it('renders NotificationChannelsItem with all channel labels and status', async () => {
    await render(<NotificationChannelsItem channels={mockChannels} />);

    expect(screen.getByText('SMS Critical Bench Alerts')).toBeTruthy();
    expect(screen.getByText('Diagnostic PDF Summaries')).toBeTruthy();
    expect(screen.getByText('Telemetry Push Pings')).toBeTruthy();
    expect(screen.getAllByText('Active')).toHaveLength(2);
    expect(screen.getByText('Inactive')).toBeTruthy();
  });

  it('calls onLogoutPress when Log Out button is pressed', async () => {
    const onLogoutPress = jest.fn();
    await render(
      <LogoutSection
        isModalVisible={false}
        isSigningOut={false}
        onLogoutPress={onLogoutPress}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('Log Out'));
    expect(onLogoutPress).toHaveBeenCalledTimes(1);
  });

  it('renders logout confirmation modal and handles confirm and cancel', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await render(
      <LogoutSection
        isModalVisible={true}
        isSigningOut={false}
        onLogoutPress={jest.fn()}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Log out of FanniTech?')).toBeTruthy();

    fireEvent.press(screen.getByText('Yes, Log Out'));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

