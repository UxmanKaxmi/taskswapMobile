import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signInWithGoogle } from '@shared/utils/googleAuth';
import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { buildQueryKey } from '@shared/constants/queryKeys';
import messaging from '@react-native-firebase/messaging';
import type { AuthResponse } from './types';

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const result = await signInWithGoogle();
      const idToken = result.data?.idToken;
      let fcmToken = '';

      if (!idToken) {
        throw new Error('Google ID token is missing. Please sign in with Google again.');
      }

      try {
        await messaging().registerDeviceForRemoteMessages();
        fcmToken = await messaging().getToken();
      } catch (error) {
        console.warn('Failed to fetch FCM token during sign-in', error);
      }

      const userPayload = {
        provider: 'google',
        id: result.data?.user?.id ?? '',
        name: result.data?.user?.name ?? '',
        email: result.data?.user?.email ?? '',
        photo: result.data?.user?.photo ?? '',
        fcmToken,
      };

      const response = await api.post(buildRoute.syncUserToDb(), userPayload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
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
