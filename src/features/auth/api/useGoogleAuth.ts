// src/features/auth/api/useGoogleAuth.ts
import { useMutation } from '@tanstack/react-query';
import { signInWithGoogle } from '@shared/utils/googleAuth';
import { api } from '@shared/api/axios';

type GoogleSignInResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
  token: string;
};

export function useGoogleAuth() {
  return useMutation({
    mutationFn: async (): Promise<GoogleSignInResponse> => {
      const result = await signInWithGoogle();
      const idToken = result.data?.idToken;

      const userPayload = {
        id: result.data?.user?.id ?? '',
        name: result.data?.user?.name ?? '',
        email: result.data?.user?.email ?? '',
        photo: result.data?.user?.photo ?? '',
      };

      const response = await api.post('/users', userPayload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      return {
        user: response.data.user,
        token: response.data.token,
      };
    },
  });
}
