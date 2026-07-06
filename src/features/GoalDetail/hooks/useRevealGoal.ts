import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Goal } from '@features/Goals/types/goals';

// One-way reveal: an anonymous goal becomes a named goal. The server rejects
// the reverse direction, so there is no "hide again".
export function useRevealGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.post(buildRoute.revealGoal(taskId));
      return response.data as Goal;
    },
    onSuccess: (data, taskId) => {
      queryClient.setQueryData<Goal | undefined>(buildQueryKey.taskById(taskId), current =>
        current ? { ...current, ...data, isAnonymous: false } : current,
      );
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.myProfile() });
    },
  });
}
