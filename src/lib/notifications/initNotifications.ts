import messaging, { type FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { handleNotificationRoute } from './notificationNavigation';
import { applyLiveQueryUpdates } from './liveQueryUpdates';
import { normalizeNotificationPayload } from './notificationRoutes';
import { showPushToast } from '@shared/utils/toast';
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

const PUSH_EVENT_TYPES = new Set(['push_received', 'task-motivation-push']);

// While the app is open, a received push shows the in-app PushToast pill
// instead of a system banner. Returns false for non-push events so the
// caller falls through to the regular banner.
function maybeShowPushReceivedToast(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  const payload = normalizeNotificationPayload(remoteMessage.data);
  const type = (payload.notificationType ?? payload.type ?? '').toLowerCase();
  if (!PUSH_EVENT_TYPES.has(type)) return false;

  const raw = (remoteMessage.data ?? {}) as Record<string, unknown>;
  const pusherName =
    (typeof raw.pusherName === 'string' && raw.pusherName.trim()) ||
    (typeof raw.senderName === 'string' && raw.senderName.trim()) ||
    '';

  // Tapping the pill opens the exact goal. Reuse the notification router so the
  // payload's taskId/type resolves to GoalDetail (and honors auth redirects).
  const onPress = () => handleNotificationRoute(remoteMessage.data);

  if (pusherName) {
    showPushToast({ pusherName, onPress });
  } else if (remoteMessage.notification?.title) {
    // No structured name in the payload — the backend-authored title already
    // reads like "Sara pushed you", so render it as the whole toast text.
    showPushToast({ pusherName: remoteMessage.notification.title, message: '', onPress });
  } else {
    showPushToast({ pusherName: 'Someone', onPress });
  }

  return true;
}

export function onForegroundNotification() {
  const unsubscribeMessagingMessage = messaging().onMessage(async remoteMessage => {
    if (__DEV__) console.log('📬 Foreground message:', remoteMessage);

    // Refresh affected query caches so on-screen counts/cards update live.
    applyLiveQueryUpdates(remoteMessage.data);

    // Push events get the in-app toast; showing a banner too would be noise.
    if (maybeShowPushReceivedToast(remoteMessage)) return;

    // Data-only messages are silent cache refreshes — no banner to show.
    if (!remoteMessage.notification) return;

    await notifee.displayNotification({
      title: remoteMessage.notification.title || 'New Notification',
      body: remoteMessage.notification.body || '',
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
