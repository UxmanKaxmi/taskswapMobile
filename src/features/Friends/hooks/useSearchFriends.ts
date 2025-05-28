import { useQuery } from '@tanstack/react-query';
import { searchFriends } from '../api/friendsAPI';
import { buildQueryKey } from '@shared/constants/queryKeys';

export function useSearchFriends(query: string, includeFollowed = true) {
  return useQuery({
    queryKey: buildQueryKey.searchFriends(query, includeFollowed),
    queryFn: () => searchFriends(query, includeFollowed),
    enabled: !!query, // Only run when query is non-empty
  });
}
