import { useQuery } from '@tanstack/react-query';

import { getBlockedUsers } from '../api/reportApi';
import { buildQueryKey } from '@shared/constants/queryKeys';

export function useBlockedUsers() {
  return useQuery({
    queryKey: buildQueryKey.blockedUsers(),
    queryFn: getBlockedUsers,
  });
}
