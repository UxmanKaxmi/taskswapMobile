// src/features/tasks/hooks/useAddTask.ts
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { AxiosError } from 'axios';
import { showToast } from '@shared/utils/toast';
import { CreateTaskPayload } from '../types/addTask.types';
import { createTask } from '../api/addTask.api';
import { Task } from '@features/Tasks/types/tasks';
import type { TaskPage } from '@features/Tasks/api/taskApi';
import type { HomeSummaryResponse } from '@features/Home/types/home';

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, AxiosError, CreateTaskPayload>({
    mutationFn: createTask,
    onSuccess: newTask => {
      // Optimistically drop the new task at the top of every feed cache so it
      // shows immediately (no wait for the background refetch).
      if (newTask?.id) {
        queryClient.setQueriesData<InfiniteData<TaskPage>>(
          { queryKey: buildQueryKey.tasks() },
          prev => {
            if (!prev?.pages?.length) return prev;
            const alreadyThere = prev.pages.some(page =>
              page.data.some(task => task.id === newTask.id),
            );
            if (alreadyThere) return prev;

            const [firstPage, ...restPages] = prev.pages;
            return {
              ...prev,
              pages: [{ ...firstPage, data: [newTask, ...firstPage.data] }, ...restPages],
            };
          },
        );
      }

      // Surface the new goal in the "YOUR GOAL" card immediately. The home feed
      // (sorted "needs a push") excludes your own tasks, so the card is driven by
      // the home summary's `yourGoal` — seed it optimistically so it shows at once.
      if (newTask?.id && newTask.type === 'motivation') {
        queryClient.setQueriesData<HomeSummaryResponse>(
          { queryKey: [QueryKeys.HomeSummary] },
          prev => {
            if (!prev) return prev;
            return {
              ...prev,
              yourGoal: {
                taskId: newTask.id,
                text: newTask.text,
                pushCount: newTask.pushCount ?? 0,
                createdAt: newTask.createdAt,
                progressCount: newTask.progressUpdates?.length ?? 0,
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
