export type NotificationTextValues = {
  taskId: string;
};

export type NotificationTextTemplate = {
  key: string;
  label: string;
  title: string;
  body: string;
  buildData: (values: NotificationTextValues) => Record<string, string>;
};

export const NOTIFICATION_TEXT_TEMPLATES: NotificationTextTemplate[] = [
  {
    key: 'latest-example',
    label: 'Momentum milestone',
    title: '🔥 Momentum milestone!',
    body: 'Your task just passed <pushCount> pushes. Keep it going.',
    buildData: values => ({
      notificationType: 'task-motivation-milestone',
      taskId: values.taskId,
      taskType: 'motivation',
      pushCount: '7',
      notificationId: 'debug-notification-1',
      screen: 'TaskDetail',
      deeplinkPath: `/tasks/${values.taskId}`,
    }),
  },
  {
    key: 'unfinished-reminder',
    label: 'Unfinished reminder',
    title: 'Your task is still waiting',
    body: 'Share a small update, or mark it done.',
    buildData: values => ({
      notificationType: 'task-motivation-unfinished-reminder',
      taskId: values.taskId,
      taskType: 'motivation',
      notificationId: 'debug-notification-7',
      screen: 'TaskDetail',
      deeplinkPath: `/tasks/${values.taskId}`,
    }),
  },
  {
    key: 'help-push-reminder',
    label: 'Help-push reminder',
    title: 'Someone could use a push today',
    body: 'Send a quick push. It takes 10 seconds.',
    buildData: () => ({
      notificationType: 'task-motivation-help-push-reminder',
      taskType: 'motivation',
      taskCount: '3',
      notificationId: 'debug-notification-8',
      screen: 'Home',
      deeplinkPath: '/',
    }),
  },
  {
    key: 'motivation-push',
    label: 'Push received',
    title: '<senderName> pushed you',
    body: '"<task text>"',
    buildData: values => ({
      notificationType: 'task-motivation-push',
      taskId: values.taskId,
      taskType: 'motivation',
      notificationId: 'debug-notification-2',
      screen: 'TaskDetail',
      deeplinkPath: `/tasks/${values.taskId}`,
    }),
  },
  {
    key: 'progress-update',
    label: 'Progress update',
    title: '📈 New update',
    body: '<senderName> shared an update on "<task text>"',
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
  {
    key: 'task-completed',
    label: 'Task completed',
    title: '🎉 They did it!',
    body: 'Your push helped <senderName> complete "<task text>".',
    buildData: values => ({
      notificationType: 'task-completed',
      taskId: values.taskId,
      taskType: 'motivation',
      notificationId: 'debug-notification-6',
      screen: 'TaskDetail',
      deeplinkPath: `/tasks/${values.taskId}`,
    }),
  },
  {
    key: 'comment-mention',
    label: 'Comment mention',
    title: '💬 You were mentioned',
    body: '<senderName>: "<first 40 chars of comment>..."',
    buildData: values => ({
      notificationType: 'comment',
      taskId: values.taskId,
      commentId: 'debug-comment-1',
      notificationId: 'debug-notification-4',
      screen: 'TaskDetail',
      deeplinkPath: `/tasks/${values.taskId}`,
    }),
  },
  {
    key: 'fallback',
    label: 'Fallback inbox',
    title: 'You have a new push',
    body: 'Open the app to see what just landed.',
    buildData: values => ({
      notificationType: 'something-unhandled',
      taskId: values.taskId,
      notificationId: 'debug-notification-5',
      screen: 'Inbox',
      deeplinkPath: '/inbox',
    }),
  },
];

export const DEFAULT_TEST_NOTIFICATION_TEXT = {
  title: '🔔 Debug Test',
  body: 'This is a test push notification!',
};

export function getNotificationTextTemplate(key: string) {
  return NOTIFICATION_TEXT_TEMPLATES.find(template => template.key === key) ?? null;
}
