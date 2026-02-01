// src/features/tasks/hooks/useTasksQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '../api/taskApi';
import { Task } from '../types/tasks';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useAuth } from '@features/Auth/AuthProvider';

export function useTasksQuery() {
  const { user, loading: authLoading } = useAuth();

  return useQuery<Task[]>({
    queryKey: buildQueryKey.tasks(user?.id),
    queryFn: getTasks,
    refetchOnMount: true, // Refetch every time screen remounts
    refetchOnReconnect: true, // Refetch when device regains internet
    refetchOnWindowFocus: true,
    enabled: !!user && !authLoading,

    // staleTime: 1000 * 60, // 1 min: prevents refetching if data is recent
  });
}
