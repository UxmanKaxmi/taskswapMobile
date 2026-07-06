import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import type { GoalPage } from '@features/Goals/api/goalApi';
import { blockUser } from '../api/reportApi';
import type { BlockUserPayload } from '../types/report.types';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlockUserPayload) => blockUser(payload),
    onSuccess: (_data, payload) => {
      queryClient.setQueriesData<InfiniteData<GoalPage>>({ queryKey: [QueryKeys.Goals] }, old => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.filter(task => task.userId !== payload.userId),
          })),
        };
      });

      queryClient.invalidateQueries({ queryKey: [QueryKeys.Goals] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.following() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.followers() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.friendProfile(payload.userId) });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.blockedUsers() });
    },
  });
}
