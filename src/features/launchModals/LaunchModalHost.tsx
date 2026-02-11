import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { launchModalRegistry } from './launchModals.registry';
import type { LaunchModalConfig, LaunchModalContext } from './launchModals.registry';
import { useLaunchModals } from './useLaunchModals';

type Props = {
  ctx: LaunchModalContext;
  registry?: LaunchModalConfig[];
};

export default function LaunchModalHost({ ctx, registry = launchModalRegistry }: Props) {
  const { active, evaluate, dismiss } = useLaunchModals({ ctx, registry });
  const [visibleId, setVisibleId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      evaluate();
    }, [evaluate]),
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!active) {
      setVisibleId(null);
      return;
    }

    setVisibleId(null);
    timeoutRef.current = setTimeout(() => {
      setVisibleId(active.id);
    }, 3000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [active]);

  const handleDismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisibleId(null);
    dismiss();
  }, [dismiss]);

  if (!active || visibleId !== active.id) return null;
  const ModalComponent = active.component;

  return <ModalComponent visible onDismiss={handleDismiss} ctx={ctx} />;
}
