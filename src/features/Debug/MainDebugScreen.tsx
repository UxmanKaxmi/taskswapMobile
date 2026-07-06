// src/features/debug/MainDebugScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, type TextStyle } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { useAuth } from '@features/Auth/AuthProvider';
import {
  sendTestNotificationAPI,
  type NotificationTestPayload,
} from '@features/Notification/api/NotificationApi';
import { Layout } from '@shared/components/Layout';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { Height } from '@shared/components/Spacing';
import { useGoalsQuery } from '@features/Goals/hooks/useGoalsQuery';
import {
  DEFAULT_TEST_NOTIFICATION_TEXT,
  getNotificationTextTemplate,
  NOTIFICATION_TEXT_TEMPLATES,
} from '@lib/notifications/notificationTextCatalog';

const FALLBACK_TASK_ID = 'debug-task-1';

type DebugValues = {
  taskId: string;
};

function DebugInput({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.field}>
      <TextElement style={styles.label}>{label}</TextElement>
      <TextElement style={styles.value}>{value}</TextElement>
    </View>
  );
}

export default function MainDebugScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const { data: tasksQuery } = useGoalsQuery();

  const latestGoalId = useMemo(() => {
    const pages = tasksQuery?.pages ?? [];

    for (const page of pages) {
      const taskId = page.data?.[0]?.id;
      if (taskId) return taskId;
    }

    return FALLBACK_TASK_ID;
  }, [tasksQuery]);

  const values: DebugValues = useMemo(
    () => ({
      taskId: latestGoalId,
    }),
    [latestGoalId],
  );
  const latestExample = getNotificationTextTemplate('latest-example');

  const sendLocalNotification = async (key: string) => {
    try {
      setSendingKey(key);
      const spec = getNotificationTextTemplate(key);
      if (!spec) return;

      const permission = await notifee.requestPermission();
      if (
        permission.authorizationStatus !== AuthorizationStatus.AUTHORIZED &&
        permission.authorizationStatus !== AuthorizationStatus.PROVISIONAL
      ) {
        Alert.alert(
          'Notifications are disabled',
          'Turn on notification permissions to test local alerts.',
        );
        return;
      }

      await notifee.displayNotification({
        title: spec.title,
        body: spec.body,
        data: spec.buildData(values),
        android: {
          channelId: 'default',
          smallIcon: 'ic_notification',
          largeIcon: require('@assets/images/logo.png'),
          color: colors.onboardingPush,
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
    } catch (error) {
      console.error('Failed to display local notification:', error);
      Alert.alert('❌ Failed to display local notification');
    } finally {
      setSendingKey(null);
    }
  };

  const sendLatestViaBackend = async () => {
    try {
      if (!user?.id) {
        Alert.alert('User not logged in');
        return;
      }

      const payload: NotificationTestPayload = {
        title: latestExample?.title ?? DEFAULT_TEST_NOTIFICATION_TEXT.title,
        body: latestExample?.body ?? DEFAULT_TEST_NOTIFICATION_TEXT.body,
        data: latestExample?.buildData(values),
      };

      await sendTestNotificationAPI(user.id, payload);
      Alert.alert('✅ Latest example notification sent!');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert('❌ Failed to send test notification');
    }
  };

  return (
    <Layout>
      <AppHeader title="Notification Test Center" />
      <Height size={20} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TextElement variant="caption" color="muted" style={styles.subtitle}>
          Using cached task id: {latestGoalId}
        </TextElement>

        <DebugInput label="Goal id" value={values.taskId} />

        <Height size={14} />

        <View style={styles.section}>
          <TextElement style={styles.sectionLabel}>Local examples</TextElement>

          {NOTIFICATION_TEXT_TEMPLATES.map(({ key, label }) => (
            <PrimaryButton
              key={key}
              title={label}
              onPress={() => sendLocalNotification(key)}
              isLoading={sendingKey === key}
              style={styles.button}
            />
          ))}
        </View>

        <Height size={10} />

        <View style={styles.section}>
          <TextElement style={styles.sectionLabel}>Backend</TextElement>
          <PrimaryButton title="Send latest example push" onPress={sendLatestViaBackend} />
        </View>
      </ScrollView>
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      paddingBottom: 24,
    },
    subtitle: {
      marginBottom: 16,
    } as TextStyle,
    field: {
      gap: 6,
    },
    label: {
      color: colors.text,
      fontWeight: '600',
    } as TextStyle,
    value: {
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    } as TextStyle,
    section: {
      gap: 8,
    },
    sectionLabel: {
      color: colors.muted,
      fontWeight: '600',
    } as TextStyle,
    button: {
      marginHorizontal: 0,
    },
  });
