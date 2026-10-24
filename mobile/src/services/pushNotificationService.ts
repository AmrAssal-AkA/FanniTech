import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined
  );
}

export async function ensureNotificationPermissionsAsync(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function getExpoPushTokenAsync(): Promise<string | null> {
  const hasPermission = await ensureNotificationPermissionsAsync();
  if (!hasPermission) {
    return null;
  }

  try {
    const projectId = getProjectId();
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenData.data;
  } catch (error) {
    console.warn('[pushNotificationService] Failed to obtain Expo push token:', error);
    return null;
  }
}

export async function getDevicePushTokenAsync(): Promise<Notifications.DevicePushToken | null> {
  const hasPermission = await ensureNotificationPermissionsAsync();
  if (!hasPermission) {
    return null;
  }

  try {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    return deviceToken;
  } catch (error) {
    console.warn('[pushNotificationService] Failed to obtain FCM device push token:', error);
    return null;
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FanniTech Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0051D5',
      enableVibrate: true,
      sound: 'default',
    });
  }

  return getExpoPushTokenAsync();
}
