import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { showToast } from '@shared/utils/toast';
import {
  createCircle,
  createCircleInvite,
  getCircle,
  getCircleInvitePreview,
  joinCircleByToken,
  leaveCircle,
  pushAllInCircle,
} from '../api/circleApi';
import type {
  CircleDetail,
  CircleInviteResponse,
  CreateCirclePayload,
  CreateCircleResponse,
  JoinCirclePayload,
  JoinCircleResponse,
  PushAllResponse,
} from '../types/circles.types';
import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';

export function getApiErrorMessage(error: AxiosError, fallback: string) {
  const data = error.response?.data as
    | { error?: string; issues?: { message: string }[] }
    | undefined;
  return data?.issues?.[0]?.message || data?.error || fallback;
}

export function useCircleQuery(circleId?: string) {
  return useQuery<CircleDetail>({
    queryKey: buildQueryKey.circleById(circleId ?? 'unknown'),
    queryFn: () => getCircle(circleId as string),
    enabled: !!circleId,
    staleTime: 15 * 1000,
    // Members watch each other's momentum live: refresh on foreground and
    // poll gently while the viewer is in the circle (same A4 treatment as
    // the goal detail owner poll).
    refetchOnWindowFocus: true,
    refetchInterval: query => (query.state.data?.viewer.isMember ? 15000 : false),
  });
}

export function useCreateCircle() {
  const queryClient = useQueryClient();

  return useMutation<CreateCircleResponse, AxiosError, CreateCirclePayload>({
    mutationFn: createCircle,
    onSuccess: () => {
      // The circle card rides the feed response; refetch puts it on top.
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
    },
    onError: error => {
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Could not start your circle'),
      });
    },
  });
}

export function useJoinCircle() {
  const queryClient = useQueryClient();

  return useMutation<JoinCircleResponse, AxiosError, { token: string; payload: JoinCirclePayload }>(
    {
      mutationFn: ({ token, payload }) => joinCircleByToken(token, payload),
      onSuccess: joined => {
        queryClient.invalidateQueries({
          queryKey: buildQueryKey.circleById(joined.circle.id),
        });
        queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
        queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
      },
    },
  );
}

export function useLeaveCircle(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, void>({
    mutationFn: () => leaveCircle(circleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.circleById(circleId) });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
    },
    onError: error => {
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Could not leave the circle'),
      });
    },
  });
}

type CircleMutationContext = { previous?: CircleDetail };

export function usePushCircleLane(circleId: string) {
  const queryClient = useQueryClient();
  const queryKey = buildQueryKey.circleById(circleId);

  return useMutation<unknown, AxiosError, { taskId: string }, CircleMutationContext>({
    mutationFn: ({ taskId }) => api.post(buildRoute.toggleGoalPush(taskId), {}),
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CircleDetail>(queryKey);

      queryClient.setQueryData<CircleDetail>(queryKey, prev => {
        if (!prev) return prev;
        return {
          ...prev,
          totalPushes: prev.totalPushes + 1,
          lanes: prev.lanes.map(lane =>
            lane.taskId === taskId && !lane.hasPushed
              ? { ...lane, hasPushed: true, pushCount: lane.pushCount + 1 }
              : lane,
          ),
        };
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Push didn’t land. Try again.'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Push] });
    },
  });
}

export function usePushAllCircle(circleId: string, viewerUserId?: string) {
  const queryClient = useQueryClient();
  const queryKey = buildQueryKey.circleById(circleId);

  return useMutation<PushAllResponse, AxiosError, void, CircleMutationContext>({
    mutationFn: () => pushAllInCircle(circleId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CircleDetail>(queryKey);

      queryClient.setQueryData<CircleDetail>(queryKey, prev => {
        if (!prev) return prev;
        const pushable = prev.lanes.filter(
          lane =>
            !lane.hasPushed &&
            lane.taskId &&
            lane.userId !== viewerUserId &&
            lane.state !== 'done' &&
            !lane.completed,
        );
        return {
          ...prev,
          totalPushes: prev.totalPushes + pushable.length,
          lanes: prev.lanes.map(lane =>
            lane.taskId &&
            !lane.hasPushed &&
            lane.userId !== viewerUserId &&
            lane.state !== 'done' &&
            !lane.completed
              ? { ...lane, hasPushed: true, pushCount: lane.pushCount + 1 }
              : lane,
          ),
        };
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Could not push the circle'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Push] });
    },
  });
}

// A quiet "thinking of you" — softer than a push. Once per member per day.
export function useNudgeMember(circleId: string) {
  const queryClient = useQueryClient();
  const queryKey = buildQueryKey.circleById(circleId);

  return useMutation<unknown, AxiosError, { userId: string }, CircleMutationContext>({
    mutationFn: ({ userId }) => api.post(buildRoute.circleNudge(circleId, userId), {}),
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CircleDetail>(queryKey);

      queryClient.setQueryData<CircleDetail>(queryKey, prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lanes: prev.lanes.map(lane =>
            lane.userId === userId ? { ...lane, viewerHasNudged: true } : lane,
          ),
        };
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Nudge didn’t land. Try again.'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// React to a member's update — a cheer on its beat, no push required.
export function useReactToUpdate(circleId: string) {
  const queryClient = useQueryClient();
  const queryKey = buildQueryKey.circleById(circleId);

  return useMutation<
    unknown,
    AxiosError,
    { beatId: string; presetKey: string },
    CircleMutationContext
  >({
    mutationFn: ({ beatId, presetKey }) => api.post(buildRoute.cheerBeat(beatId), { presetKey }),
    onMutate: async ({ beatId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CircleDetail>(queryKey);

      queryClient.setQueryData<CircleDetail>(queryKey, prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lanes: prev.lanes.map(lane =>
            lane.latestUpdate?.beatId === beatId && !lane.latestUpdate.viewerHasCheered
              ? {
                  ...lane,
                  latestUpdate: {
                    ...lane.latestUpdate,
                    viewerHasCheered: true,
                    cheerCount: lane.latestUpdate.cheerCount + 1,
                  },
                }
              : lane,
          ),
          // The timeline offers the same cheer; keep its chips in step.
          activity: prev.activity.map(event =>
            event.beatId === beatId && !event.viewerHasCheered
              ? {
                  ...event,
                  viewerHasCheered: true,
                  cheerCount: (event.cheerCount ?? 0) + 1,
                }
              : event,
          ),
        };
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Reaction didn’t land. Try again.'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Goal] });
    },
  });
}

// Post a short update to your own circle task (existing progress machinery;
// the server enforces its cooldown and fans out circle notifications).
export function useShareCircleUpdate(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, { taskId: string; text: string }>({
    mutationFn: ({ taskId, text }) => api.post(buildRoute.taskProgress(taskId), { text }),
    onSuccess: () => {
      showToast({ type: 'success', title: 'Update shared with your circle' });
    },
    onError: error => {
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Could not share your update'),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.circleById(circleId) });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Goal] });
    },
  });
}

export function useCircleInvitePreview(token?: string) {
  return useQuery({
    queryKey: buildQueryKey.circleInvitePreview(token ?? 'unknown'),
    queryFn: () => getCircleInvitePreview(token as string),
    enabled: !!token,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useCreateCircleInvite(circleId: string) {
  return useMutation<CircleInviteResponse, AxiosError, void>({
    mutationFn: () => createCircleInvite(circleId),
    onError: error => {
      showToast({
        type: 'error',
        title: getApiErrorMessage(error, 'Could not create an invite'),
      });
    },
  });
}
