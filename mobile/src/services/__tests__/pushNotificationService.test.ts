import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import {
  registerForPushNotificationsAsync,
  getExpoPushTokenAsync,
  getDevicePushTokenAsync,
  getProjectId,
} from '../pushNotificationService';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  getDevicePushTokenAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-eas-project-id',
      },
    },
  },
}));

describe('pushNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectId', () => {
    it('returns the eas projectId from Constants', () => {
      expect(getProjectId()).toBe('test-eas-project-id');
    });
  });

  describe('registerForPushNotificationsAsync', () => {
    it('returns null when running on simulator / non-device', async () => {
      Object.defineProperty(Device, 'isDevice', { value: false, configurable: true });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeNull();
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permissions when not initially granted and returns token with projectId', async () => {
      Object.defineProperty(Device, 'isDevice', { value: true, configurable: true });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[abc123xyz]' });

      const token = await registerForPushNotificationsAsync();

      expect(token).toBe('ExponentPushToken[abc123xyz]');
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'test-eas-project-id' });
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

    it('handles unexpected getExpoPushTokenAsync error gracefully without throwing', async () => {
      Object.defineProperty(Device, 'isDevice', { value: true, configurable: true });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(new Error('FCM Service Unavailable'));

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const token = await registerForPushNotificationsAsync();

      expect(token).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[pushNotificationService] Failed to obtain Expo push token:'),
        expect.any(Error),
      );

      warnSpy.mockRestore();
    });
  });

  describe('getDevicePushTokenAsync', () => {
    it('returns native FCM device token when permission is granted', async () => {
      Object.defineProperty(Device, 'isDevice', { value: true, configurable: true });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
        type: 'fcm',
        data: 'fcm-device-registration-token-12345',
      });

      const token = await getDevicePushTokenAsync();

      expect(token).toEqual({
        type: 'fcm',
        data: 'fcm-device-registration-token-12345',
      });
      expect(Notifications.getDevicePushTokenAsync).toHaveBeenCalled();
    });

    it('returns null and warns gracefully when getDevicePushTokenAsync throws', async () => {
      Object.defineProperty(Device, 'isDevice', { value: true, configurable: true });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockRejectedValue(new Error('FCM init failed'));

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const token = await getDevicePushTokenAsync();

      expect(token).toBeNull();
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
