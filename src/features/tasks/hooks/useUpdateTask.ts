// src/features/tasks/hooks/useAddTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, CreateTaskPayload } from '../api/taskApi';
import { Task } from '../types/tasks';
import { buildQueryKey } from '@shared/constants/queryKeys';

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
    },
    onError: error => {
      console.error('❌ Failed to add task:', error);
    },
  });
}
