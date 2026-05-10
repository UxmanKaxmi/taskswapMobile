import { useQuery } from '@tanstack/react-query';
import { getFollowers } from '../api/userApi';
import { buildQueryKey } from '@shared/constants/queryKeys';

export const useFollowers = (enabled: boolean = true) => {
  return useQuery({
    queryKey: buildQueryKey.followers(),
    queryFn: getFollowers,
    enabled,
  });
};
