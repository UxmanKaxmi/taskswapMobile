import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const fcmToken = await messaging().getToken();
    console.log('✅ FCM Token:', fcmToken);
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

export function onForegroundNotification() {
  messaging().onMessage(async remoteMessage => {
    console.log('📬 Foreground message:', remoteMessage);

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Notification',
      body: remoteMessage.notification?.body || '',
      android: {
        channelId: 'default',
      },
    });
  });
}

export async function onBackgroundNotification() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📥 Background message:', remoteMessage);
    // You can choose to show a Notifee notification here as well if needed
  });
}

export async function initializeNotifications() {
  await requestUserPermission();
  await createNotificationChannel();
  onForegroundNotification();
  await onBackgroundNotification();
}
