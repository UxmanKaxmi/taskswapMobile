import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signInWithGoogle } from '@shared/utils/googleAuth';
import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { buildQueryKey } from '@shared/constants/queryKeys';
import messaging from '@react-native-firebase/messaging';

type GoogleSignInResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
    fcmToken?: string;
  };
  token: string;
};

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<GoogleSignInResponse> => {
      const result = await signInWithGoogle();
      const idToken = result.data?.idToken;
      let fcmToken = '';

      try {
        await messaging().registerDeviceForRemoteMessages();
        fcmToken = await messaging().getToken();
      } catch (error) {
        console.warn('Failed to fetch FCM token during sign-in', error);
      }

      const userPayload = {
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
      });

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
