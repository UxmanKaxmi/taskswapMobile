import { useQuery } from '@tanstack/react-query';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { getFriendProfile } from '../api/friendsAPI';
import { FriendProfile } from '../types/friends';

export function useFriendProfile(id: string) {
  return useQuery<FriendProfile>({
    queryKey: buildQueryKey.friendProfile(id),
    queryFn: () => getFriendProfile(id), // ✅ fixed
    enabled: !!id,
  });
}
