// src/features/user/api/useToggleFollow.ts
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toggleFollow } from '../api/userApi';

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFollow,

    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: buildQueryKey.matchedUsers() });

      const previous = queryClient.getQueryData<any[]>(buildQueryKey.matchedUsers());

      queryClient.setQueryData(buildQueryKey.matchedUsers(), (old: any[] | undefined) =>
        old?.map(user => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)),
      );

      return { previous };
    },

    // ❌ Rollback on error
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(buildQueryKey.matchedUsers(), context.previous);
      }
    },

    // ✅ Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.matchedUsers() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.myProfile() });

      queryClient.invalidateQueries({ queryKey: buildQueryKey.followers() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.following() });
    },
  });
}
