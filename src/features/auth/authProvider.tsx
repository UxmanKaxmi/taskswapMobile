import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle, signOutGoogle } from './googleSignIn';
import { api } from '@shared/api/axios';

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

  // 🔁 Load user and token from AsyncStorage
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
    const result = await signInWithGoogle();
    const idToken = result.data?.idToken;

    const userInfo: User = {
      id: result.data?.user?.id ?? '',
      name: result.data?.user?.name ?? '',
      email: result.data?.user?.email ?? '',
      photo: result.data?.user?.photo ?? '',
    };

    const response = await api.post('/users', userInfo, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const jwt = response.data.token;

    setUser(response.data.user);
    setToken(jwt);
    api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

    console.log('[Client Token]', jwt);
    console.log('[Axios Header]', api.defaults.headers.common['Authorization']);

    await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(response.data.user));
    await AsyncStorage.setItem(STORAGE_TOKEN, jwt);
  };

  const signOut = async () => {
    await signOutGoogle();
    await AsyncStorage.multiRemove([STORAGE_USER, STORAGE_TOKEN]);
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
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
