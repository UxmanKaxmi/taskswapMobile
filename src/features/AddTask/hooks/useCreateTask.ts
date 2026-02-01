// src/features/tasks/hooks/useAddTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { AxiosError } from 'axios';
import { showToast } from '@shared/utils/toast';
import { CreateTaskPayload } from '../types/addTask.types';
import { createTask } from '../api/addTask.api';
import { Task } from '@features/Tasks/types/tasks';

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, AxiosError, CreateTaskPayload>({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
    },
    onError: error => {
      const data = error.response?.data as
        | {
            error?: string;
            issues?: { message: string; path?: string[] }[];
          }
        | undefined;

      const message = data?.issues?.[0]?.message || data?.error || 'Something went wrong';

      showToast({
        type: 'error',
        title: message,
      });

      console.error('❌ Axios Error:', error);
    },
  });
}
