// src/features/tasks/hooks/useTasksQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '../api/taskApi';
import { Task } from '../types/tasks';
import { buildQueryKey } from '@shared/constants/queryKeys';

export function useTasksQuery() {
  return useQuery<Task[]>({
    queryKey: buildQueryKey.tasks(),
    queryFn: getTasks,
    refetchOnMount: true, // Refetch every time screen remounts
    refetchOnReconnect: true, // Refetch when device regains internet
    refetchOnWindowFocus: true,
    // staleTime: 1000 * 60, // 1 min: prevents refetching if data is recent
  });
}
