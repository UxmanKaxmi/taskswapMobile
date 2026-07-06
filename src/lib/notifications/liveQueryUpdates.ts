import type { InfiniteData } from '@tanstack/react-query';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { normalizeNotificationPayload } from './notificationRoutes';
import type { GoalPage } from '@features/Goals/api/goalApi';

/**
 * Live updates over FCM.
 *
 * When another user acts on one of my goals (push, cheer, comment, progress),
 * the backend already sends an FCM message whose data payload carries
 * `notificationType` + `taskId` (and `pushCount` for pushes). While the app is
 * in the foreground we use that same message to refresh the affected React
 * Query caches, so counts and cards on screen update within a second of the
 * other user's tap — no polling and no new transport.
 *
 * Backend contract (data payload, all values strings):
 *   notificationType: PUSH_RECEIVED | task-cheer | comment | ... (see switch)
 *   taskId:           goal the event belongs to
 *   pushCount:        optional — authoritative count after a push event
 */
export function applyLiveQueryUpdates(data: unknown) {
  const payload = normalizeNotificationPayload(data);
  const type = (payload.notificationType ?? payload.type ?? '').toLowerCase();
  const taskId = payload.taskId ?? undefined;

  // Every server event also lands in the inbox, so the notification list and
  // badge should always refresh.
  void queryClient.invalidateQueries({ queryKey: buildQueryKey.notifications() });

  if (!taskId) return;

  switch (type) {
    case 'push_received':
    case 'task-motivation-push':
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.pushesForGoal(taskId) });
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
      patchFeedPushCount(taskId, payload.pushCount);
      break;

    case 'task-cheer':
    case 'task-motivation-cheer':
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.votesForGoal(taskId) });
      break;

    case 'comment':
    case 'commentmention':
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.commentsForGoal(taskId) });
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      break;

    case 'progress_update_created':
    case 'task-progress-update':
    case 'task-motivation-progress':
    case 'task-motivation-milestone':
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      break;

    case 'task-completed':
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
      break;

    default:
      // Unknown/new event types: taskId is present, so the goal itself most
      // likely changed. Refresh it and let feature-specific keys catch up on
      // their normal lifecycle.
      void queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      break;
  }
}

// Update the pushed goal's count inside cached feed pages without invalidating
// the feed itself — a full feed refetch would remove "needs a push" cards
// mid-scroll (same reasoning as useToggleGoalPush.onSettled).
function patchFeedPushCount(taskId: string, pushCountRaw?: string | null) {
  const pushCount = Number(pushCountRaw);
  if (!Number.isFinite(pushCount) || pushCount < 0) return;

  queryClient.setQueriesData<InfiniteData<GoalPage>>({ queryKey: [QueryKeys.Goals] }, old => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        data: page.data.map(t => (t.id === taskId ? { ...t, pushCount } : t)),
      })),
    };
  });
}
