import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { registerForPushNotificationsAsync } from '../pushNotificationService';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

describe('pushNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when running on simulator / non-device', async () => {
    Object.defineProperty(Device, 'isDevice', { value: false, configurable: true });

    const result = await registerForPushNotificationsAsync();

    expect(result).toBeNull();
    expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permissions when not initially granted and returns token', async () => {
    Object.defineProperty(Device, 'isDevice', { value: true, configurable: true });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[abc123xyz]' });

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('ExponentPushToken[abc123xyz]');
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('returns null when permission is denied', async () => {
    Object.defineProperty(Device, 'isDevice', { value: true, configurable: true });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('returns token immediately if permission is already granted', async () => {
    Object.defineProperty(Device, 'isDevice', { value: true, configurable: true });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[existing]' });

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('ExponentPushToken[existing]');
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });
});
