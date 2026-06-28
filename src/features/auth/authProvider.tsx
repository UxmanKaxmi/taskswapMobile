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
import { showToast } from '@shared/utils/toast';
import { queryClient } from '@lib/react-query/client';
import { registerBackendSessionRefresh, registerSignOut } from '@shared/api/authBridge';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { buildRoute } from '@shared/api/apiRoutes';

type User = {
  id: string;
  name: string;
  email: string;
  photo?: string;
};

type AuthContextType = {
  user: User | null;
  signIn: () => Promise<void>;
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
const STORAGE_HAS_SEEN_FIND_FRIENDS = 'auth:hasSeenFindFriends';
const STORAGE_FCM_TOKEN = 'fcm_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenFindFriendsScreen, setHasSeenFindFriendsScreenState] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const { mutateAsync: googleAuth } = useGoogleAuth();
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
      const seenFlag = await AsyncStorage.getItem(STORAGE_HAS_SEEN_FIND_FRIENDS);

      if (seenFlag) {
        setHasSeenFindFriendsScreenState(JSON.parse(seenFlag));
      }

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  /* ----------------------- SIGN IN ----------------------- */
  const signIn = async () => {
    try {
      const { user, token } = await googleAuth();

      setUser(user);
      setToken(token);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_TOKEN, token);

      setJustLoggedIn(true);

      showToast({
        type: 'success',
        title: 'Welcome back!',
        message: `Hello, ${user.name}`,
      });
    } catch (err: any) {
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
    const currentUser = user ?? (savedUser ? (JSON.parse(savedUser) as User) : null);

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

    api.defaults.headers.common['Authorization'] = `Bearer ${nextToken}`;

    await AsyncStorage.multiSet([
      [STORAGE_USER, JSON.stringify(nextUser)],
      [STORAGE_TOKEN, nextToken],
    ]);

    return nextToken;
  }, [user]);

  /* ----------------------- SIGN OUT ----------------------- */
  const signOut = async () => {
    await signOutGoogle();
    await AsyncStorage.multiRemove([STORAGE_USER, STORAGE_TOKEN, STORAGE_HAS_SEEN_FIND_FRIENDS]);

    setUser(null);
    setToken(null);
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

    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'See you again soon!',
    });
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
