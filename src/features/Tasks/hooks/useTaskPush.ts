import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskPush } from '../types/tasks';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { getTaskPushes, toggleTaskPush } from '../api/taskPush.api';
import { useAuth } from '@features/Auth/AuthProvider';

// ✅ Fetch pushes for a task
export function useTaskPushes(taskId: string) {
  const { isAuthenticated } = useAuth(); // or token !== null
  return useQuery<TaskPush>({
    queryKey: buildQueryKey.pushesForTask(taskId ?? ''),
    queryFn: () => getTaskPushes(taskId!),
    enabled: !!taskId && isAuthenticated,
  });
}

// ✅ Toggle push / unpush
export function useToggleTaskPush(taskId: string) {
  const queryClient = useQueryClient();
  const queryKey = buildQueryKey.pushesForTask(taskId);

  return useMutation({
    mutationFn: () => toggleTaskPush(taskId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<TaskPush>(queryKey);

      if (previous) {
        queryClient.setQueryData<TaskPush>(queryKey, {
          hasPushed: !previous.hasPushed,
          pushCount: previous.hasPushed
            ? Math.max(previous.pushCount - 1, 0)
            : previous.pushCount + 1,
        });
      }

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: buildQueryKey.taskById(taskId),
      });
    },
  });
}
