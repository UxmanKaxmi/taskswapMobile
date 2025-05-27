// src/features/auth/authProvider.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOutGoogle } from '@shared/utils/googleAuth';
import { api } from '@shared/api/axios';
import { useGoogleAuth } from './api/useGoogleAuth';
import { showToast } from '@shared/utils/toast';
import { initializeNotifications } from '@lib/notifications/initNotifications';
import { getMessaging } from '@react-native-firebase/messaging';
import { isAndroid } from '@shared/utils/constants';

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
  hasSeenFindFriendsScreen: boolean;
  setHasSeenFindFriendsScreen: (seen: boolean) => void;
};

const STORAGE_USER = 'auth:user';
const STORAGE_TOKEN = 'auth:token';
const STORAGE_HAS_SEEN_FIND_FRIENDS = 'auth:hasSeenFindFriends';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenFindFriendsScreen, setHasSeenFindFriendsScreenState] = useState(false);

  const { mutateAsync: googleAuth, isPending: authLoading, error: authError } = useGoogleAuth();
  // const { mutate: syncFcmToken } = useSyncFcmToken();

  const setHasSeenFindFriendsScreen = async (seen: boolean) => {
    await AsyncStorage.setItem(STORAGE_HAS_SEEN_FIND_FRIENDS, JSON.stringify(seen));
    setHasSeenFindFriendsScreenState(seen);
  };

  useEffect(() => {
    const loadSession = async () => {
      const savedUser = await AsyncStorage.getItem(STORAGE_USER);
      const savedToken = await AsyncStorage.getItem(STORAGE_TOKEN);

      const seenFlag = await AsyncStorage.getItem(STORAGE_HAS_SEEN_FIND_FRIENDS);
      if (seenFlag) setHasSeenFindFriendsScreenState(JSON.parse(seenFlag));

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  const signIn = async () => {
    try {
      const { user, token } = await googleAuth();
      setUser(user);
      setToken(token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_TOKEN, token);

      // 🔐 Attempt to setup notifications — but don't block login

      initializeNotifications()
        .then(async () => {
          await getMessaging().registerDeviceForRemoteMessages();
          const fcmToken = await getMessaging().getToken();
          console.log('📲 FCM Token:', fcmToken);

          // Optionally sync to backend if you have an endpoint
          // if (user?.id && fcmToken) {
          //   syncFcmToken({ userId: user.id, fcmToken });
          // }
        })
        .catch(err => {
          console.warn('⚠️ Failed to initialize notifications:', err.message);
        });

      showToast({
        type: 'success',
        title: 'Welcome back!',
        message: `Hello, ${user.name}`,
      });
    } catch (err: any) {
      console.error('🔐 Sign in failed', err);
      showToast({
        type: 'error',
        title: 'Sign-in Failed',
        message: err?.response?.data?.message || 'Something went wrong.',
      });
      throw err;
    }
  };

  const signOut = async () => {
    await signOutGoogle();
    await AsyncStorage.multiRemove([STORAGE_USER, STORAGE_TOKEN, STORAGE_HAS_SEEN_FIND_FRIENDS]);
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    setHasSeenFindFriendsScreenState(false);
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'See you again soon!',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        loading,
        token,
        hasSeenFindFriendsScreen,
        setHasSeenFindFriendsScreen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
