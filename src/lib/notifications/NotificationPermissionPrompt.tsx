import { useEffect } from 'react';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';

const PERMISSION_KEY = 'notification_permission_granted';
const FCM_TOKEN_KEY = 'fcm_token';
const AUTH_USER_KEY = 'auth:user';
const AUTH_TOKEN_KEY = 'auth:token';

const syncFcmTokenToBackend = async (fcmToken: string) => {
  try {
    const [userRaw, authToken] = await Promise.all([
      AsyncStorage.getItem(AUTH_USER_KEY),
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
    ]);

    if (!userRaw || !authToken) return;

    const parsedUser = JSON.parse(userRaw) as { id?: string };
    const userId = parsedUser?.id;
    if (!userId) return;

    await api.post(buildRoute.syncUserToDb(), { userId, fcmToken }, {
      headers: { Authorization: `Bearer ${authToken}` },
      skipToast: true,
      skipAuthLogout: true,
    } as CustomAxiosRequestConfig);
  } catch (error) {
    console.warn('Failed to sync FCM token to backend', error);
  }
};

export default function NotificationPermissionPrompt() {
  useEffect(() => {
    checkAndRequestPermission();

    const unsubscribe = messaging().onTokenRefresh(async token => {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      console.log('FCM Token refreshed:', token);
      await syncFcmTokenToBackend(token);
    });

    return unsubscribe;
  }, []);

  const checkAndRequestPermission = async () => {
    const settings = await notifee.getNotificationSettings();

    if (
      settings.authorizationStatus === AuthorizationStatus.DENIED ||
      settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED
    ) {
      const status = await notifee.requestPermission();
      const granted =
        status.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        status.authorizationStatus === AuthorizationStatus.PROVISIONAL;

      await AsyncStorage.setItem(PERMISSION_KEY, granted ? 'true' : 'false');

      if (granted) {
        await retrieveAndStoreFcmToken();
      }
    } else {
      await AsyncStorage.setItem(PERMISSION_KEY, 'true');
      await retrieveAndStoreFcmToken();
    }
  };

  const retrieveAndStoreFcmToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      await syncFcmTokenToBackend(token);
    } catch (error) {
      console.error('Error retrieving FCM token:', error);
    }
  };

  return null;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PERMISSION_KEY);
  return value === 'true';
}
