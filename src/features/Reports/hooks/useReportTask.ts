import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import type { GoalPage } from '@features/Goals/api/goalApi';
import { reportTask } from '../api/reportApi';
import type { ReportTaskPayload } from '../types/report.types';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';

export function useReportTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReportTaskPayload) => reportTask(payload),
    onSuccess: (_data, payload) => {
      // Hide the reported task from the reporter immediately (Apple UGC 1.2).
      queryClient.setQueriesData<InfiniteData<GoalPage>>({ queryKey: [QueryKeys.Goals] }, old => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.filter(task => task.id !== payload.taskId),
          })),
        };
      });

      queryClient.removeQueries({ queryKey: buildQueryKey.taskById(payload.taskId) });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Goals] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
    },
  });
}
