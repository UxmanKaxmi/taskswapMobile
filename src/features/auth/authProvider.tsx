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
};

const STORAGE_USER = 'auth:user';
const STORAGE_TOKEN = 'auth:token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { mutateAsync: googleAuth, isPending: authLoading, error: authError } = useGoogleAuth();

  useEffect(() => {
    const loadSession = async () => {
      const savedUser = await AsyncStorage.getItem(STORAGE_USER);
      const savedToken = await AsyncStorage.getItem(STORAGE_TOKEN);
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
    await AsyncStorage.multiRemove([STORAGE_USER, STORAGE_TOKEN]);
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];

    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'See you again soon!',
    });
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
