import { useEffect } from 'react';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { getGoogleIdToken } from '@shared/utils/googleAuth';

const PERMISSION_KEY = 'notification_permission_granted';
const FCM_TOKEN_KEY = 'fcm_token';
const AUTH_USER_KEY = 'auth:user';
const AUTH_TOKEN_KEY = 'auth:token';

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  photo?: string;
};

const syncFcmTokenToBackend = async (fcmToken: string) => {
  try {
    const userRaw = await AsyncStorage.getItem(AUTH_USER_KEY);

    if (!userRaw) return;

    const parsedUser = JSON.parse(userRaw) as StoredUser;
    const userId = parsedUser?.id;
    if (!userId || !parsedUser.email) return;

    const idToken = await getGoogleIdToken();
    const response = await api.post(
      buildRoute.syncUserToDb(),
      {
        id: userId,
        name: parsedUser.name ?? '',
        email: parsedUser.email,
        photo: parsedUser.photo ?? '',
        fcmToken,
      },
      {
        headers: { Authorization: `Bearer ${idToken}` },
        skipToast: true,
        skipAuthLogout: true,
        skipAuthRefresh: true,
      } as CustomAxiosRequestConfig,
    );

    if (response.data?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
    }

    if (response.data?.user) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
    }
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
