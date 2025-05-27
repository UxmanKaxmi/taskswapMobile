// src/features/debug/NotificationTester.tsx
import React from 'react';
import { View, Button } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';

export default function NotificationTester() {
  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
        smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <PrimaryButton title="Trigger Local Notification" onPress={onDisplayNotification} />
    </View>
  );
}
