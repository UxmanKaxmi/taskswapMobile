import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signInWithApple } from '@shared/utils/appleAuth';
import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { buildQueryKey } from '@shared/constants/queryKeys';
import messaging from '@react-native-firebase/messaging';
import type { AuthResponse } from './types';

export function useAppleAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const result = await signInWithApple();
      let fcmToken = '';

      try {
        await messaging().registerDeviceForRemoteMessages();
        fcmToken = await messaging().getToken();
      } catch (error) {
        console.warn('Failed to fetch FCM token during Apple sign-in', error);
      }

      const userPayload = {
        id: result.id,
        name: result.name,
        email: result.email,
        photo: '',
        fcmToken,
        provider: 'apple',
        authorizationCode: result.authorizationCode,
      };

      const response = await api.post(buildRoute.syncUserToDb(), userPayload, {
        headers: {
          Authorization: `Bearer ${result.identityToken}`,
        },
        skipAuthLogout: true,
        skipAuthRefresh: true,
      } as CustomAxiosRequestConfig);

      return {
        user: response.data.user,
        token: response.data.token,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.user() });
    },
  });
}
