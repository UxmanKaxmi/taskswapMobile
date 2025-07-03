import { useQuery } from '@tanstack/react-query';
import { getVotesForTask } from '../api/taskApi';
import { buildQueryKey } from '@shared/constants/queryKeys';

export function useGetVotes(taskId: string) {
  return useQuery({
    queryKey: buildQueryKey.votesForTask(taskId),
    queryFn: () => getVotesForTask(taskId),
    enabled: !!taskId,
  });
}
