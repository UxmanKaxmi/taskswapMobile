// src/features/user/api/useToggleFollow.ts
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toggleFollow } from '../api/userApi';
import { MatchedUser } from '@features/Friends/hooks/useMatchUsers';

export function useToggleFollow(searchQuery?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFollow,

    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: buildQueryKey.matchedUsers() });

      const previous = queryClient.getQueryData<MatchedUser[]>(buildQueryKey.matchedUsers());

      if (!previous?.some(u => u.id === userId)) {
        console.warn('⚠️ No matching user found in matchedUsers cache for toggleFollow');
      }

      queryClient.setQueryData(buildQueryKey.matchedUsers(), (old = []) =>
        (old as any[]).map(user =>
          user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user,
        ),
      );

      return { previous };
    },

    // ❌ Rollback on error
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(buildQueryKey.matchedUsers(), context.previous);
      }
    },

    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.followers() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.following() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.matchedUsers() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.myProfile() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });

      if (searchQuery?.trim()) {
        queryClient.setQueryData(
          buildQueryKey.searchFriends(searchQuery.trim(), true),
          (oldData: SearchResultFriend[] = []) =>
            oldData.map(friend =>
              friend.id === userId ? { ...friend, isFollowing: !friend.isFollowing } : friend,
            ),
        );
      }
    },
  });
}
