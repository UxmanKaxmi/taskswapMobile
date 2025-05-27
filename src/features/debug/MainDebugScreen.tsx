// src/features/debug/MainDebugScreen.tsx
import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { Height } from '@shared/components/Spacing';
import notifee from '@notifee/react-native';
import { useAuth } from '@features/Auth/authProvider';
import { sendTestNotificationAPI } from '@features/Notification/api/NotificationApi';

export default function MainDebugScreen() {
  const { user } = useAuth(); // assumes user.id is available

  const sendTestNotification = async (title: string, body: string) => {
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: 'default',
        pressAction: { id: 'default' },
      },
      ios: {
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
      },
    });
  };

  const handleSendTestNotification = async () => {
    try {
      if (!user?.id) {
        Alert.alert('User not logged in');
        return;
      }

      await sendTestNotificationAPI(user.id);
      Alert.alert('✅ Test notification sent!');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert('❌ Failed to send test notification');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TextElement variant="title" style={{ marginBottom: 20 }}>
        Notification Debug Tools
      </TextElement>

      <PrimaryButton
        title="🔔 Reminder Task Notification"
        onPress={() =>
          sendTestNotification('Reminder Task', 'This is a reminder task notification')
        }
      />
      <Height size={12} />

      <PrimaryButton
        title="✅ Completed Task Notification"
        onPress={() => sendTestNotification('Task Completed', 'You completed a task! Great job.')}
      />
      <Height size={12} />

      <PrimaryButton
        title="👥 Friend Help Notification"
        onPress={() => sendTestNotification('Friend Ping', 'A friend sent you a reminder!')}
      />
      <Height size={12} />

      <PrimaryButton
        title="💡 Suggestion Notification"
        onPress={() => sendTestNotification('AI Suggestion', 'Here’s a helpful tip for your task.')}
      />

      <PrimaryButton title="Send Test Notification" onPress={handleSendTestNotification} />
    </ScrollView>
  );
}
