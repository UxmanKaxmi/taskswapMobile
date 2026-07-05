export type AuthProviderName = 'google' | 'apple';

export type AuthResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
    fcmToken?: string;
    provider?: AuthProviderName;
  };
  token: string;
};
