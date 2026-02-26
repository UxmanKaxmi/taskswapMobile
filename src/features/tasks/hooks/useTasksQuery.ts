// src/features/tasks/hooks/useTasksQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getTasksPage, TaskPage } from '../api/taskApi';
import { Task } from '../types/tasks';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useAuth } from '@features/Auth/AuthProvider';

export function useTasksQuery() {
  const { user, loading: authLoading } = useAuth();

  return useInfiniteQuery<TaskPage>({
    queryKey: buildQueryKey.tasks(user?.id),
    queryFn: ({ pageParam }) => getTasksPage(pageParam ?? null),
    getNextPageParam: lastPage => (lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    enabled: !!user && !authLoading,
  });
}
