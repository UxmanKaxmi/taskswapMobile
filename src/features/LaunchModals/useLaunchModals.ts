import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAppLaunchCount,
  getLastShownLaunch,
  hasSeenLaunchModal,
  markLaunchModalSeen,
  setLastShownLaunch,
} from './launchModals.storage';
import type { LaunchModalConfig, LaunchModalContext } from './launchModals.registry';
import { isDEV } from '@shared/utils/constants';

type UseLaunchModalsParams = {
  ctx: LaunchModalContext;
  registry: LaunchModalConfig[];
};

export function useLaunchModals({ ctx, registry }: UseLaunchModalsParams) {
  const [active, setActive] = useState<LaunchModalConfig | null>(null);
  const evaluatingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const evaluate = useCallback(async () => {
    if (evaluatingRef.current) return;
    evaluatingRef.current = true;

    try {
      const [appLaunchCount, lastShownLaunch] = await Promise.all([
        getAppLaunchCount(),
        getLastShownLaunch(),
      ]);
      const seenById: Record<string, boolean> = {};
      if (lastShownLaunch >= appLaunchCount) {
        if (mountedRef.current) setActive(null);

        return;
      }
      const candidates = registry
        .filter(r => r.screen === 'ANY' || r.screen === ctx.screen)
        .sort((a, b) => a.priority - b.priority);

      for (const config of candidates) {
        const seen = await hasSeenLaunchModal(config.id);
        seenById[config.id] = seen;
        if (seen) continue;

        const eligible = await config.when(ctx);
        if (!eligible) continue;

        if (!mountedRef.current) return;
        setActive(config);

        return;
      }

      if (mountedRef.current) setActive(null);
    } finally {
      evaluatingRef.current = false;
    }
  }, [ctx, registry]);

  const dismiss = useCallback(async () => {
    if (!active) return;
    const appLaunchCount = await getAppLaunchCount();
    await markLaunchModalSeen(active.id);
    await setLastShownLaunch(appLaunchCount);
    if (!mountedRef.current) return;
    setActive(null);
    // small cooldown to avoid flicker between modals
    await new Promise(resolve => setTimeout(resolve, 600));
    await evaluate();
  }, [active, evaluate]);

  return { active, evaluate, dismiss };
}
