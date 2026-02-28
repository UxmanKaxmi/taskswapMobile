import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import { fetchFeatureFlags } from '@shared/api/featureFlags';
import {
  DEFAULT_FEATURE_FLAGS,
  FeatureFlags,
  getEnabledTaskTypes,
  normalizeFeatureFlags,
} from './types';
import { useAuth } from '@features/Auth/AuthProvider';

const STORAGE_KEY = 'feature:flags';
const PUBLIC_STORAGE_KEY = `${STORAGE_KEY}:public`;

type FeatureFlagsContextType = {
  flags: FeatureFlags;
  enabledTaskTypes: TaskTypeEnum[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [loading, setLoading] = useState(true);
  const storageKey = useMemo(
    () => (user?.id ? `${STORAGE_KEY}:${user.id}` : PUBLIC_STORAGE_KEY),
    [user?.id],
  );

  const refresh = useCallback(async () => {
    try {
      const remoteFlags = await fetchFeatureFlags();
      setFlags(remoteFlags);
      await AsyncStorage.setItem(storageKey, JSON.stringify(remoteFlags));
    } catch (error) {
      console.warn('[FEATURE_FLAGS] Failed to refresh flags', error);
    }
  }, [storageKey]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached && isMounted) {
          setFlags(normalizeFeatureFlags(JSON.parse(cached)));
        }
      } catch (error) {
        console.warn('[FEATURE_FLAGS] Failed to load cached flags', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      refresh().catch(() => {});
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [refresh, storageKey]);

  const enabledTaskTypes = useMemo(() => getEnabledTaskTypes(flags), [flags]);

  return (
    <FeatureFlagsContext.Provider value={{ flags, enabledTaskTypes, loading, refresh }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used inside FeatureFlagsProvider');
  return ctx;
}
