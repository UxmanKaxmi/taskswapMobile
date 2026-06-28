// src/features/debug/NotificationTester.tsx
import React from 'react';
import { Alert, View } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { colors } from '@shared/theme';
import { DEFAULT_TEST_NOTIFICATION_TEXT } from '@lib/notifications/notificationTextCatalog';

export default function NotificationTester() {
  async function onDisplayNotification() {
    try {
      const settings = await notifee.requestPermission();
      if (
        settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED &&
        settings.authorizationStatus !== AuthorizationStatus.PROVISIONAL
      ) {
        Alert.alert('Notifications are disabled', 'Enable notification permissions to test local alerts.');
        return;
      }

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      await notifee.displayNotification({
        title: DEFAULT_TEST_NOTIFICATION_TEXT.title,
        body: DEFAULT_TEST_NOTIFICATION_TEXT.body,
        android: {
          channelId,
          smallIcon: 'ic_notification',
          largeIcon: require('@assets/images/logo.png'),
          color: colors.onboardingPush,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });
    } catch (error) {
      console.error('Failed to display local notification', error);
      Alert.alert('❌ Failed to display local notification');
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <PrimaryButton title="Trigger Local Notification" onPress={onDisplayNotification} />
    </View>
  );
}
