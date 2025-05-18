import { api } from '@shared/api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(`/tasks/${taskId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate task lists or individual task queries if needed
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
