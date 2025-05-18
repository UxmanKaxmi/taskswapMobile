// src/features/tasks/hooks/useTasksQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '../api/taskApi';
import { Task } from '../types/tasks';

export function useTasksQuery() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });
}
