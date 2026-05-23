// src/features/debug/MainDebugScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, type TextStyle } from 'react-native';
import notifee from '@notifee/react-native';
import { useAuth } from '@features/Auth/AuthProvider';
import {
  sendTestNotificationAPI,
  type NotificationTestPayload,
} from '@features/Notification/api/NotificationApi';
import { Layout } from '@shared/components/Layout';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { colors } from '@shared/theme';
import { Height } from '@shared/components/Spacing';
import { useTasksQuery } from '@features/Tasks/hooks/useTasksQuery';

const FALLBACK_TASK_ID = 'debug-task-1';

type DebugValues = {
  taskId: string;
};

type DebugNotificationSpec = {
  title: string;
  body: string;
  buildData: (values: DebugValues) => Record<string, string>;
};

const LATEST_EXAMPLE: DebugNotificationSpec = {
  title: '🔥 Motivation milestone!',
  body: 'Your motivation just reached <pushCount> pushes',
  buildData: values => ({
    notificationType: 'task-motivation-milestone',
    taskId: values.taskId,
    taskType: 'motivation',
    pushCount: '7',
    notificationId: 'debug-notification-1',
    screen: 'TaskDetail',
    deeplinkPath: `/tasks/${values.taskId}`,
  }),
};

const UNFINISHED_REMINDER: DebugNotificationSpec = {
  title: 'Your motivation is still waiting',
  body: 'Share one small update or mark it complete.',
  buildData: values => ({
    notificationType: 'task-motivation-unfinished-reminder',
    taskId: values.taskId,
    taskType: 'motivation',
    notificationId: 'debug-notification-7',
    screen: 'TaskDetail',
    deeplinkPath: `/tasks/${values.taskId}`,
  }),
};

const HELP_PUSH_REMINDER: DebugNotificationSpec = {
  title: 'Someone could use a push today',
  body: 'Send a quick message of support in 10 seconds.',
  buildData: () => ({
    notificationType: 'task-motivation-help-push-reminder',
    taskType: 'motivation',
    taskCount: '3',
    notificationId: 'debug-notification-8',
    screen: 'Home',
    deeplinkPath: '/',
  }),
};

const PRESETS: Array<{ key: string; label: string; spec: DebugNotificationSpec }> = [
  {
    key: 'latest-example',
    label: 'Latest example',
    spec: LATEST_EXAMPLE,
  },
  {
    key: 'unfinished-reminder',
    label: 'Unfinished reminder',
    spec: UNFINISHED_REMINDER,
  },
  {
    key: 'help-push-reminder',
    label: 'Help push reminder',
    spec: HELP_PUSH_REMINDER,
  },
  {
    key: 'motivation-push',
    label: 'Motivation push',
    spec: {
      title: 'Uxman Kaxmi pushed your motivation.',
      body: '<task text>',
      buildData: values => ({
        notificationType: 'task-motivation-push',
        taskId: values.taskId,
        taskType: 'motivation',
        notificationId: 'debug-notification-2',
        screen: 'TaskDetail',
        deeplinkPath: `/tasks/${values.taskId}`,
      }),
    },
  },
  {
    key: 'progress-update',
    label: 'Progress update',
    spec: {
      title: '📈 Progress update',
      body: '<senderName> shared a progress update on "<task text>"',
      buildData: values => ({
        notificationType: 'task-progress-update',
        taskId: values.taskId,
        taskType: 'motivation',
        progressUpdateId: 'debug-progress-1',
        notificationId: 'debug-notification-3',
        screen: 'TaskDetail',
        deeplinkPath: `/tasks/${values.taskId}`,
      }),
    },
  },
  {
    key: 'task-completed',
    label: 'Task completed',
    spec: {
      title: '✅ Task completed',
      body: '<senderName> completed "<task text>"',
      buildData: values => ({
        notificationType: 'task-completed',
        taskId: values.taskId,
        taskType: 'motivation',
        notificationId: 'debug-notification-6',
        screen: 'TaskDetail',
        deeplinkPath: `/tasks/${values.taskId}`,
      }),
    },
  },
  {
    key: 'comment-mention',
    label: 'Comment mention',
    spec: {
      title: '💬 You were mentioned',
      body: '<first 50 chars of comment>...',
      buildData: values => ({
        notificationType: 'comment',
        taskId: values.taskId,
        commentId: 'debug-comment-1',
        notificationId: 'debug-notification-4',
        screen: 'TaskDetail',
        deeplinkPath: `/tasks/${values.taskId}`,
      }),
    },
  },
  {
    key: 'fallback',
    label: 'Fallback inbox',
    spec: {
      title: 'Unknown notification type',
      body: 'Should fall back to the inbox screen.',
      buildData: values => ({
        notificationType: 'something-unhandled',
        taskId: values.taskId,
        notificationId: 'debug-notification-5',
        screen: 'TaskDetail',
        deeplinkPath: `/tasks/${values.taskId}`,
      }),
    },
  },
];

function DebugInput({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <TextElement style={styles.label}>{label}</TextElement>
      <TextElement style={styles.value}>{value}</TextElement>
    </View>
  );
}

export default function MainDebugScreen() {
  const { user } = useAuth();
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const { data: tasksQuery } = useTasksQuery();

  const latestTaskId = useMemo(() => {
    const pages = tasksQuery?.pages ?? [];

    for (const page of pages) {
      const taskId = page.data?.[0]?.id;
      if (taskId) return taskId;
    }

    return FALLBACK_TASK_ID;
  }, [tasksQuery]);

  const values: DebugValues = useMemo(
    () => ({
      taskId: latestTaskId,
    }),
    [latestTaskId],
  );

  const sendLocalNotification = async (spec: DebugNotificationSpec, key: string) => {
    try {
      setSendingKey(key);
      await notifee.displayNotification({
        title: spec.title,
        body: spec.body,
        data: spec.buildData(values),
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
        title: LATEST_EXAMPLE.title,
        body: LATEST_EXAMPLE.body,
        data: LATEST_EXAMPLE.buildData(values),
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
          Using cached task id: {latestTaskId}
        </TextElement>

        <DebugInput label="Task id" value={values.taskId} />

        <Height size={14} />

        <View style={styles.section}>
          <TextElement style={styles.sectionLabel}>Local examples</TextElement>

          {PRESETS.map(({ key, label, spec }) => (
            <PrimaryButton
              key={key}
              title={label}
              onPress={() => sendLocalNotification(spec, key)}
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

const styles = StyleSheet.create({
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
