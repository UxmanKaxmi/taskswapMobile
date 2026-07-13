import type { AppStackParamList } from '@navigation/types/navigation';

export const NOTIFICATION_DEEP_LINK_TYPES = {
  PUSH_RECEIVED: 'PUSH_RECEIVED',
  PROGRESS_UPDATE_CREATED: 'PROGRESS_UPDATE_CREATED',
  PROGRESS_REMINDER: 'PROGRESS_REMINDER',
  TASK_MOTIVATION_UNFINISHED_REMINDER: 'task-motivation-unfinished-reminder',
  TASK_MOTIVATION_HELP_PUSH_REMINDER: 'task-motivation-help-push-reminder',
} as const;

export type NotificationDeepLinkType =
  (typeof NOTIFICATION_DEEP_LINK_TYPES)[keyof typeof NOTIFICATION_DEEP_LINK_TYPES];

export type NotificationPayload = {
  notificationType?: string;
  taskId?: string | null;
  taskType?: string | null;
  screen?: string | null;
  deeplinkPath?: string | null;
  notificationId?: string | null;
  pushId?: string | null;
  progressUpdateId?: string | null;
  beatId?: string | null;
  commentId?: string | null;
  pushCount?: string | null;
  taskCount?: string | null;
  circleId?: string | null;
  token?: string | null;
  type?: string;
};

export type NotificationRoute =
  | {
      screen: 'GoalDetail';
      params: NonNullable<AppStackParamList['GoalDetail']>;
      authCopy: {
        title: string;
        subtitle: string;
        cta: string;
      };
    }
  | {
      screen: 'CircleDetail';
      params: AppStackParamList['CircleDetail'];
      authCopy: {
        title: string;
        subtitle: string;
        cta: string;
      };
    }
  | {
      screen: 'JoinCircle';
      params: AppStackParamList['JoinCircle'];
      authCopy: {
        title: string;
        subtitle: string;
        cta: string;
      };
    }
  | {
      screen: 'NotificationMainScreen';
      authCopy: {
        title: string;
        subtitle: string;
        cta: string;
      };
    }
  | {
      screen: 'Home';
      authCopy: {
        title: string;
        subtitle: string;
        cta: string;
      };
    };

const AUTH_COPY_TASK_DETAIL = {
  title: 'Open This Goal',
  subtitle: 'Log in to view the task details, progress updates, and reminders.',
  cta: 'Log In to View',
};

const AUTH_COPY_INBOX = {
  title: 'Open Your Inbox',
  subtitle: 'Log in to view your notifications and updates.',
  cta: 'Log In to View Inbox',
};

const AUTH_COPY_HOME = {
  title: 'Open Home',
  subtitle: 'Log in to support others and see what needs a push.',
  cta: 'Log In to Support',
};

const AUTH_COPY_CIRCLE = {
  title: 'Open Your Circle',
  subtitle: "Log in to see how everyone's doing and push them forward.",
  cta: 'Log In to View',
};

function toStringOrUndefined(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function getGoalIdFromDeeplinkPath(deeplinkPath?: string | null) {
  if (!deeplinkPath) return undefined;

  const match = deeplinkPath.match(/^\/tasks\/([^/?#]+)/i);
  return match?.[1];
}

function getCircleIdFromDeeplinkPath(deeplinkPath?: string | null) {
  if (!deeplinkPath) return undefined;

  const match = deeplinkPath.match(/^\/circles\/([^/?#]+)/i);
  return match?.[1];
}

function getInviteTokenFromDeeplinkPath(deeplinkPath?: string | null) {
  if (!deeplinkPath) return undefined;

  const match = deeplinkPath.match(/^\/c\/([^/?#]+)/i);
  return match?.[1];
}

export function normalizeNotificationPayload(data: unknown): NotificationPayload {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const payload = data as Record<string, unknown>;

  return {
    notificationType: toStringOrUndefined(payload.notificationType),
    taskType: toStringOrUndefined(payload.taskType),
    screen: toStringOrUndefined(payload.screen),
    deeplinkPath: toStringOrUndefined(payload.deeplinkPath),
    notificationId: toStringOrUndefined(payload.notificationId),
    taskId: toStringOrUndefined(payload.taskId),
    pushId: toStringOrUndefined(payload.pushId),
    progressUpdateId: toStringOrUndefined(payload.progressUpdateId),
    beatId: toStringOrUndefined(payload.beatId),
    commentId: toStringOrUndefined(payload.commentId),
    pushCount: toStringOrUndefined(payload.pushCount),
    taskCount: toStringOrUndefined(payload.taskCount),
    circleId: toStringOrUndefined(payload.circleId),
    token: toStringOrUndefined(payload.token),
    type: toStringOrUndefined(payload.type),
  };
}

function buildGoalDetailRoute(
  payload: NotificationPayload,
  extra: Partial<NonNullable<AppStackParamList['GoalDetail']>> = {},
): NotificationRoute {
  return {
    screen: 'GoalDetail',
    params: {
      taskId: payload.taskId ?? undefined,
      ...(payload.pushId ? { pushId: payload.pushId } : {}),
      ...(payload.progressUpdateId ? { progressUpdateId: payload.progressUpdateId } : {}),
      ...(payload.beatId ? { beatId: payload.beatId, highlightBeatId: payload.beatId } : {}),
      ...extra,
    },
    authCopy: AUTH_COPY_TASK_DETAIL,
  };
}

function buildGoalDetailRouteOrInbox(
  payload: NotificationPayload,
  taskId?: string,
  extra: Partial<NonNullable<AppStackParamList['GoalDetail']>> = {},
): NotificationRoute {
  if (!taskId) {
    return buildInboxFallbackRoute();
  }

  return buildGoalDetailRoute({ ...payload, taskId }, extra);
}

function buildInboxFallbackRoute(): NotificationRoute {
  return {
    screen: 'NotificationMainScreen',
    authCopy: AUTH_COPY_INBOX,
  };
}

function buildHomeRoute(): NotificationRoute {
  return {
    screen: 'Home',
    authCopy: AUTH_COPY_HOME,
  };
}

export function getNotificationRoute(data: unknown): NotificationRoute {
  const payload = normalizeNotificationPayload(data);
  const notificationType = (payload.notificationType ?? payload.type ?? '').toLowerCase();
  const taskId = payload.taskId ?? getGoalIdFromDeeplinkPath(payload.deeplinkPath);
  const circleId = payload.circleId ?? getCircleIdFromDeeplinkPath(payload.deeplinkPath);

  // Circle notifications deep-link to the circle detail — except invites,
  // which land on the join screen (mood picker + Join button).
  if (notificationType.startsWith('circle-')) {
    if (notificationType === 'circle-invite') {
      const token = payload.token ?? getInviteTokenFromDeeplinkPath(payload.deeplinkPath);
      if (token) {
        return {
          screen: 'JoinCircle',
          params: { token },
          authCopy: AUTH_COPY_CIRCLE,
        };
      }
      return buildInboxFallbackRoute();
    }

    if (!circleId) {
      return buildInboxFallbackRoute();
    }
    return {
      screen: 'CircleDetail',
      params: { circleId },
      authCopy: AUTH_COPY_CIRCLE,
    };
  }

  switch (notificationType) {
    case NOTIFICATION_DEEP_LINK_TYPES.TASK_MOTIVATION_HELP_PUSH_REMINDER:
      return buildHomeRoute();

    case NOTIFICATION_DEEP_LINK_TYPES.TASK_MOTIVATION_UNFINISHED_REMINDER:
      if (!taskId) {
        return buildInboxFallbackRoute();
      }
      return buildGoalDetailRoute(
        { ...payload, taskId },
        {
          scrollTo: 'progress',
          openUpdateComposer: true,
        },
      );

    case NOTIFICATION_DEEP_LINK_TYPES.PUSH_RECEIVED.toLowerCase():
    case 'task-helper':
    case 'task-advice':
    case 'decision-done':
    case 'reminder':
    case 'task-completed':
      return buildGoalDetailRouteOrInbox(payload, taskId);

    case NOTIFICATION_DEEP_LINK_TYPES.PROGRESS_UPDATE_CREATED.toLowerCase():
    case 'task-progress-update':
    case 'task-motivation-progress':
      return buildGoalDetailRouteOrInbox(payload, taskId, {
        scrollTo: 'progress',
      });

    case NOTIFICATION_DEEP_LINK_TYPES.PROGRESS_REMINDER.toLowerCase():
      return buildGoalDetailRouteOrInbox(payload, taskId, {
        scrollTo: 'progress',
        openUpdateComposer: true,
      });

    case 'task-motivation-push':
      return buildGoalDetailRouteOrInbox(payload, taskId);

    case 'task-cheer':
    case 'task-motivation-cheer':
      return buildGoalDetailRouteOrInbox(payload, taskId, {
        scrollTo: 'progress',
        highlightBeatId: payload.beatId ?? undefined,
      });

    case 'task-motivation-milestone':
      return buildGoalDetailRouteOrInbox(payload, taskId, {
        scrollTo: 'progress',
      });

    case 'task-pushed-task-milestone':
      return buildGoalDetailRouteOrInbox(payload, taskId);

    case 'comment':
    case 'commentmention':
      return buildGoalDetailRouteOrInbox(payload, taskId, {
        highlightCommentId: payload.commentId ?? undefined,
      });

    default:
      if (!taskId) {
        return buildInboxFallbackRoute();
      }
      return buildInboxFallbackRoute();
  }
}
