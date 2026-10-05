import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dehydrate, focusManager, hydrate, QueryClient, QueryKey } from '@tanstack/react-query';
import type { DehydratedState, Query } from '@tanstack/react-query';

import { QueryKeys } from '@shared/constants/queryKeys';

const QUERY_CACHE_STORAGE_KEY = 'react-query:persisted-cache:v1';
const QUERY_CACHE_BUSTER = 'home-feed-v1';
const QUERY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const QUERY_CACHE_PERSIST_THROTTLE_MS = 1000;

type PersistedQueryCache = {
  buster: string;
  timestamp: number;
  clientState: DehydratedState;
};

const persistableQueryRoots = new Set<string>([
  QueryKeys.Goals,
  QueryKeys.Goal,
  QueryKeys.HomeSummary,
  QueryKeys.Push,
  QueryKeys.ReminderNotes,
  QueryKeys.Votes,
  QueryKeys.Comments,
  QueryKeys.Circle,
]);

let didRestorePersistedQueryCache = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

// React Native has no window focus, so bridge AppState foregrounding into
// react-query's focusManager. Queries that opt into refetchOnWindowFocus
// (task detail, the feed) refresh when the app returns to the foreground.
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

AppState.addEventListener('change', onAppStateChange);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: QUERY_CACHE_MAX_AGE_MS,
      // Off by default to avoid refetching every query on each foreground.
      // Screens that need fresh data on focus (e.g. task detail) opt in
      // per-query; the AppState bridge above makes those opt-ins real.
      refetchOnWindowFocus: false,
    },
  },
});

function getQueryRoot(queryKey: QueryKey) {
  const [root] = queryKey;
  return typeof root === 'string' ? root : null;
}

function shouldPersistQuery(query: Query) {
  const root = getQueryRoot(query.queryKey);
  const dataUpdatedAt = query.state.dataUpdatedAt;

  return (
    query.state.status === 'success' &&
    !!root &&
    persistableQueryRoots.has(root) &&
    dataUpdatedAt > 0 &&
    Date.now() - dataUpdatedAt <= QUERY_CACHE_MAX_AGE_MS
  );
}

async function persistQueryCache() {
  const clientState = dehydrate(queryClient, {
    shouldDehydrateQuery: shouldPersistQuery,
    shouldDehydrateMutation: () => false,
  });

  if (clientState.queries.length === 0) {
    await AsyncStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
    return;
  }

  const persistedCache: PersistedQueryCache = {
    buster: QUERY_CACHE_BUSTER,
    timestamp: Date.now(),
    clientState,
  };

  await AsyncStorage.setItem(QUERY_CACHE_STORAGE_KEY, JSON.stringify(persistedCache));
}

function scheduleQueryCachePersist() {
  if (!didRestorePersistedQueryCache || persistTimer) return;

  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistQueryCache().catch(error => {
      console.warn('[QUERY_CACHE] Failed to persist query cache', error);
    });
  }, QUERY_CACHE_PERSIST_THROTTLE_MS);
}

queryClient.getQueryCache().subscribe(scheduleQueryCachePersist);

export async function restorePersistedQueryCache() {
  if (didRestorePersistedQueryCache) return;

  try {
    const serializedCache = await AsyncStorage.getItem(QUERY_CACHE_STORAGE_KEY);
    if (!serializedCache) return;

    const persistedCache = JSON.parse(serializedCache) as PersistedQueryCache;
    const isExpired = Date.now() - persistedCache.timestamp > QUERY_CACHE_MAX_AGE_MS;

    if (persistedCache.buster !== QUERY_CACHE_BUSTER || isExpired) {
      await AsyncStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
      return;
    }

    hydrate(queryClient, persistedCache.clientState);
  } catch (error) {
    console.warn('[QUERY_CACHE] Failed to restore query cache', error);
    await AsyncStorage.removeItem(QUERY_CACHE_STORAGE_KEY).catch(() => {});
  } finally {
    didRestorePersistedQueryCache = true;
  }
}

export async function clearPersistedQueryCache() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }

  await AsyncStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
}
