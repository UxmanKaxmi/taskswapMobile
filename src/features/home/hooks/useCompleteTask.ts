// src/features/tasks/api/useCompleteTask.ts

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@features/Tasks/types/tasks';
import type { UserProfile } from '@features/MyProfile/types/myProfile.types';
import { navigationRef } from '@navigation/navigationRef';

const FIRST_COMPLETION_FEEDBACK_PROMPT_KEY = 'feedback:firstTaskCompletionPromptShown';

async function maybeShowFirstCompletionFeedbackPrompt(tasksDoneBefore?: number) {
  if (typeof tasksDoneBefore === 'number' && tasksDoneBefore > 0) return;

  const hasPrompted = await AsyncStorage.getItem(FIRST_COMPLETION_FEEDBACK_PROMPT_KEY);
  if (hasPrompted) return;

  await AsyncStorage.setItem(FIRST_COMPLETION_FEEDBACK_PROMPT_KEY, 'true');

  Alert.alert('How did PushMeUp feel to use?', undefined, [
    { text: 'Not Now', style: 'cancel' },
    {
      text: 'Send Feedback',
      onPress: () => {
        if (!navigationRef.isReady()) return;

        navigationRef.navigate('App', {
          screen: 'SendFeedbackScreen',
        });
      },
    },
  ]);
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(buildRoute.completeTask(taskId));
      return response.data;
    },
    onSuccess: (data, taskId) => {
      const myProfile = queryClient.getQueryData<UserProfile>(buildQueryKey.myProfile());

      queryClient.setQueryData<Task | undefined>(buildQueryKey.taskById(taskId), current =>
        current
          ? {
              ...current,
              ...data,
              completed: true,
              completedAt: data?.completedAt ?? new Date().toISOString(),
            }
          : current,
      );
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.myProfile() });

      void maybeShowFirstCompletionFeedbackPrompt(myProfile?.tasksDone);
    },
  });
}
