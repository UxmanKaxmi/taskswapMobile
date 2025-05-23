// src/features/friends/hooks/useMatchUsers.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api/axios';
import { fetchGoogleContacts } from '@shared/utils/googleAuth';
import { buildRoute } from '@shared/api/apiRoutes';
import { buildQueryKey } from '@shared/constants/queryKeys';

export interface MatchedUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  isFollowing: boolean;
}

async function fetchMatchedUsers(): Promise<MatchedUser[]> {
  const emails = await fetchGoogleContacts();
  const resp = await api.post(buildRoute.matchUsers(), { emails });

  return resp.data.map((u: any) => ({
    ...u,
  }));
}

export function useMatchUsers() {
  return useQuery({
    queryKey: buildQueryKey.matchedUsers(),
    queryFn: fetchMatchedUsers,
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}
