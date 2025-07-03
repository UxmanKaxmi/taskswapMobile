import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteOnTask } from '../api/taskApi';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { Task } from '../types/tasks';

export function useCastVote(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (option: string) => voteOnTask(taskId, option),

    onMutate: async (option: string) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: buildQueryKey.votesForTask(taskId) }),
        queryClient.cancelQueries({ queryKey: buildQueryKey.tasks() }),
      ]);

      const previousVotes = queryClient.getQueryData<Record<string, number>>(
        buildQueryKey.votesForTask(taskId),
      );
      const previousTasks = queryClient.getQueryData<Task[]>(buildQueryKey.tasks());

      // ✅ Optimistically update votesForTask cache
      queryClient.setQueryData<Record<string, number>>(buildQueryKey.votesForTask(taskId), old => {
        const updated = { ...(old || {}) };
        updated[option] = (updated[option] || 0) + 1;
        return updated;
      });

      // ✅ Optimistically update task list cache
      if (previousTasks) {
        const updatedTasks = previousTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                votedOption: option,
                votes: {
                  ...task.votes,
                  [option]: {
                    ...task.votes?.[option],
                    count: (task.votes?.[option]?.count || 0) + 1,
                  },
                },
              }
            : task,
        );
        queryClient.setQueryData(buildQueryKey.tasks(), updatedTasks);
      }

      return { previousVotes, previousTasks };
    },

    onError: (_err, _option, context) => {
      if (context?.previousVotes) {
        queryClient.setQueryData(buildQueryKey.votesForTask(taskId), context.previousVotes);
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(buildQueryKey.tasks(), context.previousTasks);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.votesForTask(taskId) });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
    },
  });
}
