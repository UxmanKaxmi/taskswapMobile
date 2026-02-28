// useVote.ts
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { voteOnTask, type TaskPage } from '../api/taskApi';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { Task } from '../types/tasks';

/**
 * Minimal user info used for optimistic preview updates
 */
type Me = {
  id: string;
  name?: string;
  photo?: string;
};

/**
 * Payload passed from UI when voting
 */
type Payload = {
  nextOption: string;
  prevOption?: string;
  me: Me;
};

/**
 * Insert or update the current user inside a preview list
 */
const upsert = (list: any[] = [], me: Me) => {
  const idx = list.findIndex(x => x.id === me.id);
  if (idx === -1) return [me, ...list];

  const copy = list.slice();
  copy[idx] = { ...copy[idx], ...me };
  return copy;
};

/**
 * Remove the current user from a preview list
 */
const remove = (list: any[] = [], id: string) => {
  return list.filter(x => x.id !== id);
};

export function useCastVote(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * 🔗 Network request
     * Only sends the vote intent to the backend.
     * UI updates are handled optimistically below.
     */
    mutationFn: ({ nextOption, prevOption }: Payload) =>
      voteOnTask(taskId, { nextOption, prevOption }),

    /**
     * 🚀 OPTIMISTIC UPDATE
     * Runs BEFORE the request is sent.
     */
    onMutate: async ({ nextOption, prevOption, me }: Payload) => {
      const qkVotes = buildQueryKey.votesForTask(taskId);
      const qkTasks = buildQueryKey.tasks(me.id);
      const qkTask = buildQueryKey.taskById(taskId);

      /**
       * ⛔ Stop outgoing refetches so they don’t overwrite
       * our optimistic updates mid-flight.
       */
      await Promise.all([
        queryClient.cancelQueries({ queryKey: qkVotes }),
        queryClient.cancelQueries({ queryKey: qkTasks }),
        queryClient.cancelQueries({ queryKey: qkTask }),
      ]);

      /**
       * 📦 Snapshot previous cache values
       * Used for rollback if the mutation fails.
       */
      const prevVotes = queryClient.getQueryData<Record<string, number>>(qkVotes);
      const prevTasks = queryClient.getQueryData<InfiniteData<TaskPage>>(qkTasks);
      const prevTask = queryClient.getQueryData<Task>(qkTask);

      /**
       * 🧮 Optimistically update raw vote counts cache
       */
      queryClient.setQueryData<Record<string, number>>(qkVotes, old => {
        const next = { ...(old || {}) };

        next[nextOption] = (next[nextOption] || 0) + 1;

        if (prevOption) {
          next[prevOption] = Math.max(0, (next[prevOption] || 0) - 1);
        }

        return next;
      });

      /**
       * 🧠 Apply optimistic changes to a Task object
       */
      const applyVote = (task: Task): Task => {
        if (task.id !== taskId) return task;

        const votes = { ...task.votes };

        // Add vote to selected option
        const nextBox = votes[nextOption] ?? { count: 0, preview: [] };
        votes[nextOption] = {
          ...nextBox,
          count: (nextBox.count || 0) + 1,
          preview: upsert(nextBox.preview, me),
        };

        // Remove vote from previous option (if switching)
        if (prevOption) {
          const prevBox = votes[prevOption] ?? { count: 0, preview: [] };
          votes[prevOption] = {
            ...prevBox,
            count: Math.max(0, (prevBox.count || 0) - 1),
            preview: remove(prevBox.preview, me.id),
          };
        }

        // Recalculate total votes
        const voteCount = Object.values(votes).reduce((sum, v) => sum + (v.count || 0), 0) || 0;

        return {
          ...task,
          votedOption: nextOption, // used by UI immediately
          hasVoted: true, // critical for footer logic
          voteCount, // critical for footer copy
          votes,
        };
      };

      /**
       * 🗂 Update task list cache
       * IMPORTANT: always update, even if cache is empty
       */
      queryClient.setQueryData<InfiniteData<TaskPage>>(qkTasks, old => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(applyVote),
          })),
        };
      });

      /**
       * 🧾 Update single task cache (detail screen)
       */
      if (prevTask) {
        queryClient.setQueryData<Task>(qkTask, applyVote(prevTask));
      }

      /**
       * 🔙 Return snapshot for rollback
       */
      return { prevVotes, prevTasks, prevTask, qkTasks };
    },

    /**
     * ❌ Rollback optimistic updates if request fails
     */
    onError: (_error, _variables, context) => {
      if (!context) return;

      if (context.prevVotes) {
        queryClient.setQueryData(buildQueryKey.votesForTask(taskId), context.prevVotes);
      }

      if (context.prevTasks && context.qkTasks) {
        queryClient.setQueryData(context.qkTasks, context.prevTasks);
      }
    },

    /**
     * 🔄 Final reconciliation with server state
     * Runs whether the request succeeds or fails.
     */
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: buildQueryKey.votesForTask(taskId),
      });

      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Tasks],
      });

      queryClient.invalidateQueries({
        queryKey: buildQueryKey.taskById(taskId),
      });
    },
  });
}
