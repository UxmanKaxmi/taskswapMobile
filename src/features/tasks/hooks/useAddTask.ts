// src/features/tasks/hooks/useAddTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../api/taskApi';
import { CreateTaskPayload } from '../api/taskApi';
import { Task } from '../types/tasks';

export function useAddTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: error => {
      console.error('❌ Failed to add task:', error);
    },
  });
}
