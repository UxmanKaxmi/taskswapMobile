import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { haptics } from '@shared/utils/haptics';
import { useMemo, useCallback } from 'react';
import { showPushToast } from '@shared/utils/toast';

type UsePushInteractionParams = {
  hasPushed: boolean;
  pushCount: number;
  onPush: () => void;
  onUnpush?: () => void;
  isPushing?: boolean;
  pushToast?: {
    pusherName: string;
    message?: string;
  };
};

export function usePushInteraction({
  hasPushed,
  pushCount,
  onPush,
  onUnpush,
  isPushing = false,
  pushToast,
}: UsePushInteractionParams) {
  const checkAuthThenNavigate = useCheckAuthThenNavigate();

  const othersCount = Math.max(pushCount - 1, 0);

  const pushedText = useMemo(() => {
    if (!hasPushed) {
      return `${pushCount} people pushed this`;
    }

    if (othersCount > 0) {
      return `You and ${othersCount} other${othersCount === 1 ? '' : 's'} pushed this`;
    }

    return 'You pushed this';
  }, [hasPushed, pushCount, othersCount]);

  const handlePush = useCallback(() => {
    if (isPushing || hasPushed) return;

    // 🔐 Auth check only
    if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Push' })) return;

    haptics.success();
    if (pushToast) {
      showPushToast(pushToast);
    }
    onPush();
  }, [isPushing, hasPushed, onPush, checkAuthThenNavigate, pushToast]);

  const handleUnpush = useCallback(() => {
    if (!onUnpush) return;

    haptics.selection();
    onUnpush();
  }, [onUnpush]);

  return {
    hasPushed,
    pushCount,
    pushedText,
    handlePush,
    handleUnpush,
  };
}
