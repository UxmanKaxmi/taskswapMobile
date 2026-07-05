import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { getGoogleIdToken } from '@shared/utils/googleAuth';
import { openAppSettings } from '@navigation/types/navigationUtils';
import NotificationPermissionModal from './NotificationPermissionModal';

const PERMISSION_KEY = 'notification_permission_granted';
const PROMPT_DISMISSED_KEY = 'notification_permission_prompt_dismissed';
const FCM_TOKEN_KEY = 'fcm_token';
const AUTH_USER_KEY = 'auth:user';
const AUTH_TOKEN_KEY = 'auth:token';

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  photo?: string;
};

type PromptListener = () => void;

const promptListeners = new Set<PromptListener>();
let pendingPrompt = false;

const syncFcmTokenToBackend = async (fcmToken: string) => {
  try {
    const userRaw = await AsyncStorage.getItem(AUTH_USER_KEY);

    if (!userRaw) return;

    const parsedUser = JSON.parse(userRaw) as StoredUser;
    const userId = parsedUser?.id?.trim();
    const name = parsedUser?.name?.trim();
    const email = parsedUser?.email?.trim();

    if (!userId || !name || !email) return;

    const idToken = await getGoogleIdToken();
    const response = await api.post(
      buildRoute.syncUserToDb(),
      {
        id: userId,
        name,
        email,
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

const syncPermissionState = async () => {
  const settings = await notifee.getNotificationSettings();

  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  await AsyncStorage.setItem(PERMISSION_KEY, granted ? 'true' : 'false');

  if (granted) {
    await retrieveAndStoreFcmToken();
  }
};

const retrieveAndStoreFcmToken = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    if (__DEV__) console.log('FCM Token:', token);
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    await syncFcmTokenToBackend(token);
  } catch (error) {
    console.error('Error retrieving FCM token:', error);
  }
};

async function hasDismissedNotificationPrompt(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PROMPT_DISMISSED_KEY);
  return value === 'true';
}

export async function hasNotificationPermission(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  await AsyncStorage.setItem(PERMISSION_KEY, granted ? 'true' : 'false');

  return granted;
}

async function canShowNotificationPermissionPrompt(): Promise<boolean> {
  const [hasPermission, dismissed] = await Promise.all([
    hasNotificationPermission(),
    hasDismissedNotificationPrompt(),
  ]);

  return !hasPermission && !dismissed;
}

function emitNotificationPermissionPrompt() {
  if (promptListeners.size === 0) {
    pendingPrompt = true;
    return;
  }

  pendingPrompt = false;
  promptListeners.forEach(listener => listener());
}

export async function requestNotificationPermissionPrompt() {
  await syncPermissionState();

  if (!(await canShowNotificationPermissionPrompt())) {
    return false;
  }

  emitNotificationPermissionPrompt();
  return true;
}

export async function requestNotificationPermissionPromptForValueMoment() {
  await syncPermissionState();

  if (await hasNotificationPermission()) {
    return false;
  }

  emitNotificationPermissionPrompt();
  return true;
}

export function forceNotificationPermissionPrompt() {
  emitNotificationPermissionPrompt();
}

export async function markNotificationPermissionPromptDismissed() {
  await AsyncStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
}

export async function requestNotificationPermissionAndSync() {
  const settings = await notifee.getNotificationSettings();

  if (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  ) {
    await AsyncStorage.setItem(PERMISSION_KEY, 'true');
    await retrieveAndStoreFcmToken();
    return true;
  }

  const status = await notifee.requestPermission();
  const granted =
    status.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    status.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  await AsyncStorage.setItem(PERMISSION_KEY, granted ? 'true' : 'false');

  if (granted) {
    await retrieveAndStoreFcmToken();
    return true;
  }

  return false;
}

export function subscribeToNotificationPermissionPrompt(listener: PromptListener) {
  promptListeners.add(listener);

  if (pendingPrompt) {
    pendingPrompt = false;
    setTimeout(listener, 0);
  }

  return () => {
    promptListeners.delete(listener);
  };
}

export default function NotificationPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  const hidePrompt = useCallback(() => {
    visibleRef.current = false;
    setVisible(false);
  }, []);

  const handleTurnOn = useCallback(async () => {
    try {
      const granted = await requestNotificationPermissionAndSync();
      if (!granted) {
        await openAppSettings();
      }
    } finally {
      await markNotificationPermissionPromptDismissed();
      hidePrompt();
    }
  }, [hidePrompt]);

  const handleNotNow = useCallback(async () => {
    await markNotificationPermissionPromptDismissed();
    hidePrompt();
  }, [hidePrompt]);

  useEffect(() => {
    void syncPermissionState();

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      if (__DEV__) console.log('FCM Token refreshed:', token);
      await syncFcmTokenToBackend(token);
    });

    const unsubscribePrompt = subscribeToNotificationPermissionPrompt(() => {
      if (visibleRef.current) return;
      visibleRef.current = true;
      setVisible(true);
    });

    const appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void syncPermissionState();
      }
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribePrompt();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <NotificationPermissionModal
      visible={visible}
      onTurnOnNotifications={handleTurnOn}
      onNotNow={handleNotNow}
      onRequestClose={handleNotNow}
    />
  );
}
