import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendCheer, type SendCheerPayload } from '../api/goalCheer.api';
import type { BeatCheerState, Goal } from '../types/goals';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';

function mergeBeatCheerState(task: Goal, cheerState: BeatCheerState): Goal {
  if (!task.beats?.length) return task;

  return {
    ...task,
    beats: task.beats.map(beat =>
      beat.beatId === cheerState.beatId || beat.id === cheerState.beatId
        ? { ...beat, ...cheerState }
        : beat,
    ),
  };
}

export function useSendCheer(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendCheerPayload) => sendCheer(payload),
    onSuccess: cheerState => {
      queryClient.setQueryData<Goal>(buildQueryKey.taskById(taskId), old =>
        old ? mergeBeatCheerState(old, cheerState) : old,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Goals] });
    },
  });
}
