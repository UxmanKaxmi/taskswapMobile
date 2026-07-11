import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@features/Auth/AuthProvider';
import { useFeatureFlags } from '@shared/featureFlags';
import { getMe } from '@features/MyProfile/api/MyProfileAPI';
import { resetFirstTimeHintsOnServer, writeFirstTimeHintState } from './hintsApi';
import {
  CHEER_DISCOVERY_MAX_RENDERS,
  FIRST_TIME_HINT_FLAG_KEYS,
  FirstTimeHintId,
  FirstTimeHintMap,
  FirstTimeHintWrittenState,
  mergeFirstTimeHints,
  normalizeFirstTimeHints,
} from './firstTimeHints';

const STATE_STORAGE_KEY = 'hints:state';
const RENDERS_STORAGE_KEY = 'hints:renders';

// 'unknown' while signed out or before the cached map has loaded — a hint
// must never flash and then disappear, so unknown renders nothing.
export type FirstTimeHintStatus = FirstTimeHintWrittenState | 'pending' | 'unknown';

type RenderCounts = Partial<Record<FirstTimeHintId, number>>;

type FirstTimeHintsContextType = {
  ready: boolean;
  statusOf: (hintId: FirstTimeHintId) => FirstTimeHintStatus;
  completeHint: (hintId: FirstTimeHintId) => void;
  dismissHint: (hintId: FirstTimeHintId) => void;
  markHintRendered: (hintId: FirstTimeHintId) => void;
  renderCountOf: (hintId: FirstTimeHintId) => number;
  // True once a spotlight has actually opened this app session. Spotlights
  // use it to refuse re-opening on every Home refocus — a hint that was
  // shown and backed out of waits for the next session, it does not nag.
  hasRenderedThisSession: (hintId: FirstTimeHintId) => boolean;
  refresh: () => Promise<void>;
  // Testing convenience (debug tools): resets server + local state so every
  // hint re-teaches this account.
  resetHints: () => Promise<void>;
};

const FirstTimeHintsContext = createContext<FirstTimeHintsContextType | undefined>(undefined);

export function FirstTimeHintsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [hints, setHints] = useState<FirstTimeHintMap>({});
  const [ready, setReady] = useState(false);
  // Render counts are snapshotted at bootstrap so a hint never vanishes
  // mid-session because its own render tripped the cap.
  const [renderCounts, setRenderCounts] = useState<RenderCounts>({});

  const hintsRef = useRef<FirstTimeHintMap>({});
  const renderCountsRef = useRef<RenderCounts>({});
  const sessionRenderedRef = useRef<Set<FirstTimeHintId>>(new Set());

  const userId = user?.id;
  // Guests get device-local hint state (no server map to ride). On sign-in
  // the bootstrap re-runs against the account map, which then governs —
  // guest-mode dismissals deliberately do not migrate to the new account.
  const stateKey = `${STATE_STORAGE_KEY}:${userId ?? 'guest'}`;
  const rendersKey = `${RENDERS_STORAGE_KEY}:${userId ?? 'guest'}`;

  const persistHints = useCallback(
    (next: FirstTimeHintMap) => {
      hintsRef.current = next;
      setHints(next);
      if (stateKey) {
        AsyncStorage.setItem(stateKey, JSON.stringify(next)).catch(() => {});
      }
    },
    [stateKey],
  );

  const reconcile = useCallback(
    (server: FirstTimeHintMap) => {
      const { merged, unsynced } = mergeFirstTimeHints(hintsRef.current, server);

      // Local knows a stronger state than the server — a write was missed;
      // re-send it to heal the gap.
      unsynced.forEach(hintId => {
        const entry = merged[hintId];
        if (entry) {
          writeFirstTimeHintState(hintId, entry.state).catch(() => {});
        }
      });

      persistHints(merged);
    },
    [persistHints],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const profile = await getMe();
      reconcile(normalizeFirstTimeHints(profile.firstTimeHints));
    } catch (error) {
      console.warn('[FIRST_TIME_HINTS] Failed to refresh from server', error);
    }
  }, [userId, reconcile]);

  useEffect(() => {
    let isMounted = true;

    setReady(false);
    hintsRef.current = {};
    setHints({});
    renderCountsRef.current = {};
    setRenderCounts({});
    sessionRenderedRef.current = new Set();

    const bootstrap = async () => {
      try {
        const [cachedState, cachedRenders] = await Promise.all([
          AsyncStorage.getItem(stateKey),
          AsyncStorage.getItem(rendersKey),
        ]);
        if (!isMounted) return;

        if (cachedState) {
          const parsed = normalizeFirstTimeHints(JSON.parse(cachedState));
          hintsRef.current = parsed;
          setHints(parsed);
        }
        if (cachedRenders) {
          const parsed = (JSON.parse(cachedRenders) ?? {}) as RenderCounts;
          renderCountsRef.current = parsed;
          setRenderCounts(parsed);
        }
      } catch (error) {
        console.warn('[FIRST_TIME_HINTS] Failed to load cached state', error);
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }

      refresh().catch(() => {});
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
    // Only the user identity should re-run bootstrap; refresh/stateKey are
    // derived from it.
  }, [userId]);

  const statusOf = useCallback(
    (hintId: FirstTimeHintId): FirstTimeHintStatus => {
      if (!ready) return 'unknown';
      return hints[hintId]?.state ?? 'pending';
    },
    [ready, hints],
  );

  // Returns true when the write changed local state (i.e. the hint was still
  // pending, or a dismissal upgraded to completed).
  const applyLocal = useCallback(
    (hintId: FirstTimeHintId, state: FirstTimeHintWrittenState): boolean => {
      const current = hintsRef.current[hintId]?.state;
      if (current === 'completed' || current === state) return false;

      persistHints({
        ...hintsRef.current,
        [hintId]: { state, at: new Date().toISOString() },
      });
      return true;
    },
    [persistHints],
  );

  const completeHint = useCallback(
    (hintId: FirstTimeHintId) => {
      const changed = applyLocal(hintId, 'completed');
      if (!changed || !userId) return;

      // The server also completes hints inside its own mutation handlers;
      // this direct write just closes the gap when that path is missed.
      writeFirstTimeHintState(hintId, 'completed').catch(() => {});
    },
    [applyLocal],
  );

  const dismissHint = useCallback(
    (hintId: FirstTimeHintId) => {
      const changed = applyLocal(hintId, 'dismissed');
      if (!changed || !userId) return;
      writeFirstTimeHintState(hintId, 'dismissed').catch(() => {});
    },
    [applyLocal],
  );

  const markHintRendered = useCallback(
    (hintId: FirstTimeHintId) => {
      if (!rendersKey || sessionRenderedRef.current.has(hintId)) return;
      sessionRenderedRef.current.add(hintId);

      const next = {
        ...renderCountsRef.current,
        [hintId]: (renderCountsRef.current[hintId] ?? 0) + 1,
      };
      renderCountsRef.current = next;
      AsyncStorage.setItem(rendersKey, JSON.stringify(next)).catch(() => {});
    },
    [rendersKey],
  );

  const renderCountOf = useCallback(
    (hintId: FirstTimeHintId) => renderCounts[hintId] ?? 0,
    [renderCounts],
  );

  const hasRenderedThisSession = useCallback(
    (hintId: FirstTimeHintId) => sessionRenderedRef.current.has(hintId),
    [],
  );

  // Server first: if the wipe fails, local state stays intact rather than
  // desyncing (a local-only wipe would be re-completed by reconcile anyway).
  const resetHints = useCallback(async () => {
    if (userId) {
      await resetFirstTimeHintsOnServer();
    }

    hintsRef.current = {};
    setHints({});
    renderCountsRef.current = {};
    setRenderCounts({});
    sessionRenderedRef.current = new Set();

    if (stateKey) AsyncStorage.removeItem(stateKey).catch(() => {});
    if (rendersKey) AsyncStorage.removeItem(rendersKey).catch(() => {});
  }, [stateKey, rendersKey]);

  const value = useMemo(
    () => ({
      ready,
      statusOf,
      completeHint,
      dismissHint,
      markHintRendered,
      renderCountOf,
      hasRenderedThisSession,
      refresh,
      resetHints,
    }),
    [
      ready,
      statusOf,
      completeHint,
      dismissHint,
      markHintRendered,
      renderCountOf,
      hasRenderedThisSession,
      refresh,
      resetHints,
    ],
  );

  return <FirstTimeHintsContext.Provider value={value}>{children}</FirstTimeHintsContext.Provider>;
}

export function useFirstTimeHints() {
  const ctx = useContext(FirstTimeHintsContext);
  if (!ctx) {
    throw new Error('useFirstTimeHints must be used inside FirstTimeHintsProvider');
  }
  return ctx;
}

// True only when the remote flags allow the hint AND its state is pending.
// Surfaces combine this with their own eligibility predicates.
export function useFirstTimeHintVisibility(hintId: FirstTimeHintId): boolean {
  const { flags } = useFeatureFlags();
  const { statusOf, renderCountOf } = useFirstTimeHints();

  if (!flags.firstTimeBeats || !flags[FIRST_TIME_HINT_FLAG_KEYS[hintId]]) {
    return false;
  }
  if (statusOf(hintId) !== 'pending') return false;
  if (
    hintId === 'cheer_discovery' &&
    renderCountOf('cheer_discovery') >= CHEER_DISCOVERY_MAX_RENDERS
  ) {
    return false;
  }
  return true;
}
