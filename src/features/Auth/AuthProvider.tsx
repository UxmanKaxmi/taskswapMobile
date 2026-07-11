// src/features/auth/AuthProvider.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGoogleIdToken, signOutGoogle } from '@shared/utils/googleAuth';
import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';
import { useGoogleAuth } from './api/useGoogleAuth';
import { useAppleAuth } from './api/useAppleAuth';
import type { AuthProviderName } from './api/types';
import { showToast } from '@shared/utils/toast';
import { queryClient } from '@lib/react-query/client';
import {
  registerBackendSessionRefresh,
  registerSignOut,
  type SignOutOptions,
} from '@shared/api/authBridge';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { buildRoute } from '@shared/api/apiRoutes';
import { requestNotificationPermissionPromptForValueMoment } from '@lib/notifications/NotificationPermissionPrompt';

type User = {
  id: string;
  name: string;
  email: string;
  photo?: string;
  provider?: AuthProviderName;
};

type AuthContextType = {
  user: User | null;
  signIn: (provider?: AuthProviderName) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  token: string | null;
  isAuthenticated: boolean; // ✅

  hasSeenFindFriendsScreen: boolean;
  setHasSeenFindFriendsScreen: (seen: boolean) => void;
  justLoggedIn: boolean;
  consumeJustLoggedIn: () => void;
};

const STORAGE_USER = 'auth:user';
const STORAGE_TOKEN = 'auth:token';
const STORAGE_AUTH_PROVIDER = 'auth:provider';
const STORAGE_HAS_SEEN_FIND_FRIENDS = 'auth:hasSeenFindFriends';
const STORAGE_FCM_TOKEN = 'fcm_token';
const LOGIN_NOTIFICATION_PROMPT_DELAY_MS = 600;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<AuthProviderName | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenFindFriendsScreen, setHasSeenFindFriendsScreenState] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const { mutateAsync: googleAuth } = useGoogleAuth();
  const { mutateAsync: appleAuth } = useAppleAuth();
  const isAuthenticated = !!token && !loading;
  const setHasSeenFindFriendsScreen = async (seen: boolean) => {
    await AsyncStorage.setItem(STORAGE_HAS_SEEN_FIND_FRIENDS, JSON.stringify(seen));
    setHasSeenFindFriendsScreenState(seen);
  };
  const consumeJustLoggedIn = () => setJustLoggedIn(false);

  // Load saved session
  useEffect(() => {
    const loadSession = async () => {
      const savedUser = await AsyncStorage.getItem(STORAGE_USER);
      const savedToken = await AsyncStorage.getItem(STORAGE_TOKEN);
      const savedAuthProvider = await AsyncStorage.getItem(STORAGE_AUTH_PROVIDER);
      const seenFlag = await AsyncStorage.getItem(STORAGE_HAS_SEEN_FIND_FRIENDS);

      if (seenFlag) {
        setHasSeenFindFriendsScreenState(JSON.parse(seenFlag));
      }

      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser) as User;
        const parsedProvider =
          savedAuthProvider === 'apple' || savedAuthProvider === 'google'
            ? savedAuthProvider
            : (parsedUser.provider ?? 'google');

        setUser(parsedUser);
        setToken(savedToken);
        setAuthProvider(parsedProvider);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  /* ----------------------- SIGN IN ----------------------- */
  const signIn = async (provider: AuthProviderName = 'google') => {
    try {
      const { user, token } = provider === 'apple' ? await appleAuth() : await googleAuth();
      const nextUser = { ...user, provider };

      setUser(nextUser);
      setToken(token);
      setAuthProvider(provider);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await AsyncStorage.setMany({
        [STORAGE_USER]: JSON.stringify(nextUser),
        [STORAGE_TOKEN]: token,
        [STORAGE_AUTH_PROVIDER]: provider,
      });

      setJustLoggedIn(true);
      setTimeout(() => {
        void requestNotificationPermissionPromptForValueMoment();
      }, LOGIN_NOTIFICATION_PROMPT_DELAY_MS);

      showToast({
        type: 'success',
        title: 'Welcome back!',
        message: `Hello, ${nextUser.name}`,
      });
    } catch (err: any) {
      const isAppleCancel =
        provider === 'apple' &&
        (err?.code === '1001' ||
          err?.code === 'ERR_REQUEST_CANCELED' ||
          err?.message?.toLowerCase?.().includes('canceled'));

      if (isAppleCancel) {
        throw err;
      }

      showToast({
        type: 'error',
        title: 'Sign-in Failed',
        message: err?.response?.data?.message || 'Something went wrong.',
      });
      throw err;
    }
  };

  const refreshBackendSession = useCallback(async () => {
    const savedUser = await AsyncStorage.getItem(STORAGE_USER);
    const savedAuthProvider = await AsyncStorage.getItem(STORAGE_AUTH_PROVIDER);
    const currentUser = user ?? (savedUser ? (JSON.parse(savedUser) as User) : null);
    const currentProvider =
      authProvider ??
      (savedAuthProvider === 'apple' || savedAuthProvider === 'google'
        ? savedAuthProvider
        : (currentUser?.provider ?? 'google'));

    if (currentProvider !== 'google') return null;

    const userId = currentUser?.id?.trim();
    const name = currentUser?.name?.trim();
    const email = currentUser?.email?.trim();

    if (!userId || !name || !email) return null;

    await AsyncStorage.removeItem(STORAGE_TOKEN);
    delete api.defaults.headers.common['Authorization'];

    const [idToken, fcmToken] = await Promise.all([
      getGoogleIdToken(),
      AsyncStorage.getItem(STORAGE_FCM_TOKEN),
    ]);

    const response = await api.post(
      buildRoute.syncUserToDb(),
      {
        id: userId,
        name,
        email,
        photo: currentUser.photo ?? '',
        fcmToken: fcmToken ?? '',
      },
      {
        headers: { Authorization: `Bearer ${idToken}` },
        skipToast: true,
        skipAuthLogout: true,
        skipAuthRefresh: true,
      } as CustomAxiosRequestConfig,
    );

    const nextToken = response.data?.token;
    const nextUser = response.data?.user ?? currentUser;

    if (!nextToken) return null;

    setUser(nextUser);
    setToken(nextToken);
    setAuthProvider('google');

    api.defaults.headers.common['Authorization'] = `Bearer ${nextToken}`;

    await AsyncStorage.setMany({
      [STORAGE_USER]: JSON.stringify(nextUser),
      [STORAGE_TOKEN]: nextToken,
      [STORAGE_AUTH_PROVIDER]: 'google',
    });

    return nextToken;
  }, [authProvider, user]);

  /* ----------------------- SIGN OUT ----------------------- */
  const signOut = async (options?: SignOutOptions) => {
    if (!authProvider || authProvider === 'google') {
      try {
        await signOutGoogle();
      } catch (error) {
        console.warn('Failed to sign out of Google before clearing local session.', error);
      }
    }

    await AsyncStorage.removeMany([
      STORAGE_USER,
      STORAGE_TOKEN,
      STORAGE_AUTH_PROVIDER,
      STORAGE_HAS_SEEN_FIND_FRIENDS,
    ]);

    setUser(null);
    setToken(null);
    setAuthProvider(null);
    setJustLoggedIn(false);

    // Clear React Query data
    // Remove the specific user-related cache immediately
    queryClient.removeQueries({
      queryKey: buildQueryKey.myProfile(),
      exact: true,
    });

    // Then clear EVERYTHING
    queryClient.clear();

    delete api.defaults.headers.common['Authorization'];

    setHasSeenFindFriendsScreenState(false);

    if (options?.showToast !== false) {
      showToast({
        type: 'info',
        title: 'Signed out',
        message: 'See you again soon!',
      });
    }
  };

  // Register logout handler for external callers
  useEffect(() => {
    registerSignOut(signOut);
    registerBackendSessionRefresh(refreshBackendSession);
  }, [refreshBackendSession, signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        loading,
        token,
        isAuthenticated, // ✅ ADD THIS

        hasSeenFindFriendsScreen,
        setHasSeenFindFriendsScreen,
        justLoggedIn,
        consumeJustLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const useIsOwner = (ownerId?: string | null) => {
  const { user } = useAuth();

  if (!ownerId || !user?.id) return false;

  return ownerId === user.id;
};
