// src/features/tasks/hooks/useGoalsQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { FeedSortKey, getGoalsPage, GoalPage } from '../api/goalApi';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useAuth } from '@features/Auth/AuthProvider';

export function useGoalsQuery(sort: FeedSortKey = 'needs_push') {
  const { user, loading: authLoading } = useAuth();

  return useInfiniteQuery<GoalPage>({
    queryKey: buildQueryKey.tasks(user?.id, sort),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => getGoalsPage((pageParam as string | null) ?? null, undefined, sort),
    getNextPageParam: lastPage => (lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    enabled: !!user && !authLoading,
  });
}
