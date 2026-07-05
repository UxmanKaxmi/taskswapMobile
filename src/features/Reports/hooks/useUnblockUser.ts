import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unblockUser } from '../api/reportApi';
import type { BlockedUser, BlockUserPayload } from '../types/report.types';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlockUserPayload) => unblockUser(payload),
    onSuccess: (_data, payload) => {
      queryClient.setQueryData<BlockedUser[]>(buildQueryKey.blockedUsers(), old =>
        old?.filter(user => user.id !== payload.userId),
      );
      queryClient.invalidateQueries({ queryKey: buildQueryKey.blockedUsers() });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Goals] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.following() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.followers() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.friendProfile(payload.userId) });
    },
  });
}
