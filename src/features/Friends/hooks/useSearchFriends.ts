import { useQuery } from '@tanstack/react-query';
import { searchFriends } from '../api/friendsAPI';
import { buildQueryKey } from '@shared/constants/queryKeys';
import type { SearchResultFriend } from '../types/friends';

function isSeededFriend(friend: SearchResultFriend) {
  const name = friend.name?.toLowerCase() ?? '';
  const email = friend.email?.toLowerCase() ?? '';

  if (name.includes('seeded-user')) return true;
  if (name.includes('seeded user')) return true;
  if (email.includes('seeded-user-')) return true;
  return false;
}

export function useSearchFriends(query: string, includeFollowed = true) {
  return useQuery({
    queryKey: buildQueryKey.searchFriends(query, includeFollowed),
    queryFn: async () => {
      const results = await searchFriends(query, includeFollowed);
      return results.filter(friend => !isSeededFriend(friend));
    },
    enabled: !!query, // Only run when query is non-empty
  });
}
