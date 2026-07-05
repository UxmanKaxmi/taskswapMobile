import {
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { GoalPush } from '../types/goals';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { getGoalPushes, toggleGoalPush } from '../api/goalPush.api';
import { useAuth } from '@features/Auth/AuthProvider';
import type { HomeSummaryResponse } from '@features/Home/types/home';
import type { GoalPage } from '@features/Goals/api/goalApi';

// ✅ Fetch pushes for a task
export function useGoalPushes(taskId: string) {
  const { isAuthenticated } = useAuth(); // or token !== null
  return useQuery<GoalPush>({
    queryKey: buildQueryKey.pushesForGoal(taskId ?? ''),
    queryFn: () => getGoalPushes(taskId!),
    enabled: !!taskId && isAuthenticated,
    // Avoid a network refetch every time a feed card remounts while scrolling.
    // The toggle mutation invalidates this key explicitly, so pushed/unpushed
    // state still updates correctly despite the longer staleTime.
    staleTime: 60_000,
  });
}

// ✅ Toggle push / unpush
export function useToggleGoalPush(taskId: string) {
  const queryClient = useQueryClient();
  const queryKey = buildQueryKey.pushesForGoal(taskId);

  return useMutation({
    mutationFn: () => toggleGoalPush(taskId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<GoalPush>(queryKey);

      if (previous) {
        const nextHasPushed = !previous.hasPushed;

        queryClient.setQueryData<GoalPush>(queryKey, {
          hasPushed: nextHasPushed,
          pushCount: previous.hasPushed
            ? Math.max(previous.pushCount - 1, 0)
            : previous.pushCount + 1,
          pushedAt: nextHasPushed ? (previous.pushedAt ?? new Date().toISOString()) : null,
          createdAt: nextHasPushed ? (previous.createdAt ?? new Date().toISOString()) : null,
        });
      }

      const nextHasPushed = previous ? !previous.hasPushed : true;
      const compactStatusDelta = nextHasPushed ? 1 : -1;
      const previousHomeSummaries = queryClient.getQueriesData<HomeSummaryResponse>({
        queryKey: [QueryKeys.HomeSummary],
      });

      // Keep the pushed task's count consistent inside the cached feed pages.
      // The hero carousel derives its counts from these feed task objects, so
      // without this patch the hero shows a stale push count on the same screen
      // (we intentionally do NOT invalidate the feed list — see onSettled).
      const previousFeeds = queryClient.getQueriesData<InfiniteData<GoalPage>>({
        queryKey: [QueryKeys.Goals],
      });

      queryClient.setQueriesData<InfiniteData<GoalPage>>(
        { queryKey: [QueryKeys.Goals] },
        old => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.map(t =>
                t.id === taskId
                  ? {
                      ...t,
                      hasPushed: nextHasPushed,
                      pushCount: Math.max(0, (t.pushCount ?? 0) + compactStatusDelta),
                    }
                  : t,
              ),
            })),
          };
        },
      );

      queryClient.setQueriesData<HomeSummaryResponse>(
        { queryKey: [QueryKeys.HomeSummary] },
        old => {
          if (!old?.compactStatus) return old;

          const pushedTodayCount = Math.max(
            0,
            old.compactStatus.pushedTodayCount + compactStatusDelta,
          );

          return {
            ...old,
            compactStatus: {
              ...old.compactStatus,
              pushedTodayCount,
              streakDay: pushedTodayCount > 0 ? Math.max(old.compactStatus.streakDay, 1) : 0,
            },
          };
        },
      );

      return { previous, previousHomeSummaries, previousFeeds };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }

      context?.previousHomeSummaries?.forEach(([homeSummaryQueryKey, homeSummaryData]) => {
        queryClient.setQueryData(homeSummaryQueryKey, homeSummaryData);
      });

      context?.previousFeeds?.forEach(([feedQueryKey, feedData]) => {
        queryClient.setQueryData(feedQueryKey, feedData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: buildQueryKey.taskById(taskId),
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HomeSummary],
      });
      // NOTE: we intentionally do NOT invalidate the feed list (buildQueryKey.tasks())
      // here. On the "Needs a push" feed the server drops a task once it has been
      // pushed, so refetching immediately would yank the card out from under the
      // user the instant they tap Push. Instead the card stays put (showing
      // "Pushed ✓") and only leaves on the next feed reload — pull-to-refresh,
      // tab switch (focus refetch), or feed-sort change.
    },
  });
}
