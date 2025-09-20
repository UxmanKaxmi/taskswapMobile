// useVote.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteOnTask } from '../api/taskApi';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { Task } from '../types/tasks';

type Me = { id: string; name?: string; photo?: string };
type Payload = { nextOption: string; prevOption?: string; me: Me };

const upsert = (list: any[] = [], me: Me) => {
  const idx = list.findIndex(x => x.id === me.id);
  if (idx === -1) return [me, ...list];
  const copy = list.slice();
  copy[idx] = { ...copy[idx], ...me };
  return copy;
};
const remove = (list: any[] = [], id: string) => list.filter(x => x.id !== id);

export function useCastVote(taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ nextOption, prevOption }: Payload) =>
      voteOnTask(taskId, { nextOption, prevOption }),

    onMutate: async ({ nextOption, prevOption, me }: Payload) => {
      const qkVotes = buildQueryKey.votesForTask(taskId);
      const qkTasks = buildQueryKey.tasks();
      const qkTask = buildQueryKey.taskById(taskId);

      await Promise.all([
        qc.cancelQueries({ queryKey: qkVotes }),
        qc.cancelQueries({ queryKey: qkTasks }),
        qc.cancelQueries({ queryKey: qkTask }),
      ]);

      const prevVotes = qc.getQueryData<Record<string, number>>(qkVotes);
      const prevTasks = qc.getQueryData<Task[]>(qkTasks);
      const prevTask = qc.getQueryData<Task>(qkTask);

      // counts
      qc.setQueryData<Record<string, number>>(qkVotes, old => {
        const next = { ...(old || {}) };
        next[nextOption] = (next[nextOption] || 0) + 1;
        if (prevOption) next[prevOption] = Math.max(0, (next[prevOption] || 0) - 1);
        return next;
      });

      const apply = (t: Task): Task => {
        if (t.id !== taskId) return t;
        const votes = { ...t.votes };

        const nextBox = votes[nextOption] ?? { count: 0, preview: [] };
        votes[nextOption] = {
          ...nextBox,
          count: (nextBox.count || 0) + 1,
          preview: upsert(nextBox.preview, me), // 👈 add me
        };

        if (prevOption) {
          const prevBox = votes[prevOption] ?? { count: 0, preview: [] };
          votes[prevOption] = {
            ...prevBox,
            count: Math.max(0, (prevBox.count || 0) - 1),
            preview: remove(prevBox.preview, me.id), // 👈 remove me
          };
        }

        return { ...t, votedOption: nextOption, votes };
      };

      if (prevTasks) qc.setQueryData<Task[]>(qkTasks, prevTasks.map(apply));
      if (prevTask) qc.setQueryData<Task>(qkTask, apply(prevTask));

      return { prevVotes, prevTasks, prevTask };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prevVotes) qc.setQueryData(buildQueryKey.votesForTask(taskId), ctx.prevVotes);
      if (ctx?.prevTasks) qc.setQueryData(buildQueryKey.tasks(), ctx.prevTasks);
      if (ctx?.prevTask) qc.setQueryData(buildQueryKey.taskById(taskId), ctx.prevTask);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: buildQueryKey.votesForTask(taskId) });
      qc.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      qc.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buildQueryKey.votesForTask(taskId) });
      qc.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      qc.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
    },
  });
}
