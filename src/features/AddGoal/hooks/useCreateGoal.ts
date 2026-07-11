// src/features/tasks/hooks/useAddGoal.ts
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { AxiosError } from 'axios';
import { showToast } from '@shared/utils/toast';
import { CreateGoalPayload } from '../types/addGoal.types';
import { createGoal } from '../api/addGoal.api';
import { Goal } from '@features/Goals/types/goals';
import type { GoalPage } from '@features/Goals/api/goalApi';
import type { HomeSummaryResponse } from '@features/Home/types/home';
import { useFirstTimeHints } from '@features/FirstTimeHints';

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { completeHint } = useFirstTimeHints();

  return useMutation<Goal, AxiosError, CreateGoalPayload>({
    mutationFn: createGoal,
    onSuccess: newGoal => {
      // Graduates the "+" spotlight; the server records completion too.
      completeHint('first_goal_posted');
      // Optimistically drop the new task at the top of every feed cache so it
      // shows immediately (no wait for the background refetch).
      if (newGoal?.id) {
        queryClient.setQueriesData<InfiniteData<GoalPage>>(
          { queryKey: buildQueryKey.tasks() },
          prev => {
            if (!prev?.pages?.length) return prev;
            const alreadyThere = prev.pages.some(page =>
              page.data.some(task => task.id === newGoal.id),
            );
            if (alreadyThere) return prev;

            const [firstPage, ...restPages] = prev.pages;
            return {
              ...prev,
              pages: [{ ...firstPage, data: [newGoal, ...firstPage.data] }, ...restPages],
            };
          },
        );
      }

      // Surface the new goal in the "YOUR GOAL" card immediately. The home feed
      // (sorted "needs a push") excludes your own tasks, so the card is driven by
      // the home summary's `yourGoal` — seed it optimistically so it shows at once.
      if (newGoal?.id && newGoal.type === 'motivation') {
        queryClient.setQueriesData<HomeSummaryResponse>(
          { queryKey: [QueryKeys.HomeSummary] },
          prev => {
            if (!prev) return prev;
            return {
              ...prev,
              yourGoal: {
                taskId: newGoal.id,
                text: newGoal.text,
                pushCount: newGoal.pushCount ?? 0,
                createdAt: newGoal.createdAt,
                progressCount: newGoal.progressUpdates?.length ?? 0,
              },
            };
          },
        );
      }

      // Reconcile with the server (full task shape + summary counts).
      // NOTE: use the bare key prefixes — the home summary is keyed by utc offset
      // (`[HomeSummary, <offset>]`), so `buildQueryKey.homeSummary()` (no offset)
      // would not match and the refetch would silently never fire.
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
    },
    onError: error => {
      const data = error.response?.data as
        | {
            error?: string;
            issues?: { message: string; path?: string[] }[];
          }
        | undefined;

      const message = data?.issues?.[0]?.message || data?.error || 'Something went wrong';

      showToast({
        type: 'error',
        title: message,
      });

      console.error('❌ Axios Error:', error);
    },
  });
}
