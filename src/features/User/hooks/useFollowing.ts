import { buildQueryKey } from '@shared/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { getFollowing } from '../api/userApi';

export const useFollowing = () => {
  return useQuery({
    queryKey: buildQueryKey.following(),
    queryFn: getFollowing,
  });
};
