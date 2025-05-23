import { useQuery } from '@tanstack/react-query';
import { getFollowers } from '../api/userApi';
import { buildQueryKey } from '@shared/constants/queryKeys';

export const useFollowers = () => {
  return useQuery({
    queryKey: buildQueryKey.followers(),
    queryFn: getFollowers,
  });
};
