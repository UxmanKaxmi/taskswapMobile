import React, { useEffect } from 'react';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSION_KEY = 'notification_permission_granted';
const FCM_TOKEN_KEY = 'fcm_token';

export default function NotificationPermissionPrompt() {
  useEffect(() => {
    checkAndRequestPermission();
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
      // TODO: Send the token to your backend server for registration
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
