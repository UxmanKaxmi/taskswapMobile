import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { handleNotificationRoute } from './notificationNavigation';
// Headless module (no React components): system notification accents can't
// follow the in-app theme, so we use the light palette explicitly.
import { lightColors } from '@shared/theme';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const fcmToken = await messaging().getToken();
    if (__DEV__) console.log('✅ FCM Token:', fcmToken);
    // Optionally send to your backend
  }
}

export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

function getResponseKey(data?: Record<string, unknown> | null, fallback?: string | null) {
  return (
    fallback ||
    (typeof data?.notificationId === 'string' && data.notificationId) ||
    (typeof data?.pushId === 'string' && data.pushId) ||
    (typeof data?.progressUpdateId === 'string' && data.progressUpdateId) ||
    (typeof data?.commentId === 'string' && data.commentId) ||
    (typeof data?.taskId === 'string' && data.taskId) ||
    (typeof data?.notificationType === 'string' && data.notificationType) ||
    undefined
  );
}

export function onForegroundNotification() {
  const unsubscribeMessagingMessage = messaging().onMessage(async remoteMessage => {
    if (__DEV__) console.log('📬 Foreground message:', remoteMessage);

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Notification',
      body: remoteMessage.notification?.body || '',
      android: {
        channelId: 'default',
        smallIcon: 'ic_notification',
        largeIcon: require('@assets/images/logo.png'),
        color: lightColors.onboardingPush,
        pressAction: {
          id: 'default',
        },
      },
      data: remoteMessage.data,
    });
  });

  const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
    if (type !== EventType.PRESS && type !== EventType.ACTION_PRESS) return;

    handleNotificationRoute(detail.notification?.data, {
      responseKey: getResponseKey(
        detail.notification?.data as Record<string, unknown> | null,
        detail.notification?.id ?? null,
      ),
    });
  });

  const unsubscribeMessagingOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    handleNotificationRoute(remoteMessage.data, {
      responseKey: getResponseKey(remoteMessage.data, remoteMessage.messageId ?? null),
    });
  });

  void Promise.all([messaging().getInitialNotification(), notifee.getInitialNotification()])
    .then(([messagingInitial, notifeeInitial]) => {
      if (messagingInitial) {
        handleNotificationRoute(messagingInitial.data, {
          responseKey: getResponseKey(messagingInitial.data, messagingInitial.messageId ?? null),
        });
      }

      if (notifeeInitial) {
        handleNotificationRoute(notifeeInitial.notification?.data, {
          responseKey: getResponseKey(
            notifeeInitial.notification?.data as Record<string, unknown> | null,
            notifeeInitial.notification?.id ?? null,
          ),
        });
      }
    })
    .catch(error => {
      console.warn('Failed to read initial notification response', error);
    });

  return () => {
    unsubscribeMessagingMessage();
    unsubscribeNotifeeForeground();
    unsubscribeMessagingOpened();
  };
}

export function registerBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    if (__DEV__) console.log('📥 Background message:', remoteMessage);
    // You can choose to show a Notifee notification here as well if needed
  });
}

export function registerBackgroundNotificationEventHandler() {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type !== EventType.PRESS && type !== EventType.ACTION_PRESS) return;

    handleNotificationRoute(detail.notification?.data, {
      responseKey: getResponseKey(
        detail.notification?.data as Record<string, unknown> | null,
        detail.notification?.id ?? null,
      ),
    });
  });
}

export async function initializeNotifications() {
  await createNotificationChannel();
  return onForegroundNotification();
}
