// src/features/friends/hooks/useMatchUsers.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api/axios';
import { fetchAllContacts, fetchGoogleContacts } from '@shared/utils/googleAuth';
import { buildRoute } from '@shared/api/apiRoutes';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useAuth } from '@features/Auth/authProvider'; // Adjust path as needed

export interface MatchedUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  isFollowing: boolean;
  source: 'google' | 'phone'; // 👈 add this
}

async function fetchMatchedUsers(currentUserEmail: string): Promise<MatchedUser[]> {
  const contacts = await fetchAllContacts(); // [{ email, source }]
  const emailToSourceMap = new Map<string, 'google' | 'phone'>();

  const filteredContacts = contacts.filter(
    c => c.email.toLowerCase() !== currentUserEmail.toLowerCase(),
  );

  filteredContacts.forEach(c => {
    if (!emailToSourceMap.has(c.email)) {
      emailToSourceMap.set(c.email, c.source);
    }
  });

  const emails = filteredContacts.map(c => c.email);
  const resp = await api.post(buildRoute.matchUsers(), { emails });

  return resp.data.map((user: any) => ({
    ...user,
    source: emailToSourceMap.get(user.email) || 'phone',
  }));
}

export function useMatchUsers() {
  const { user } = useAuth(); // 🔐 get current user's email
  const email = user?.email;
  const shouldFetch = !!email;

  return useQuery({
    queryKey: buildQueryKey.matchedUsers(),
    queryFn: () => fetchMatchedUsers(email!), // ✅ tell TypeScript it's safe here
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}
