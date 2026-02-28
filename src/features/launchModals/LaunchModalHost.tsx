import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { launchModalRegistry } from './launchModals.registry';
import type { LaunchModalConfig, LaunchModalContext } from './launchModals.registry';
import { useLaunchModals } from './useLaunchModals';

type Props = {
  ctx: LaunchModalContext;
  registry?: LaunchModalConfig[];
};

const SHOW_DELAY_MS = 3000;

export default function LaunchModalHost({ ctx, registry = launchModalRegistry }: Props) {
  const { active, evaluate, dismiss } = useLaunchModals({ ctx, registry });
  const [visibleId, setVisibleId] = useState<string | null>(null);
  const [renderedId, setRenderedId] = useState<string | null>(null);
  const [renderConfig, setRenderConfig] = useState<LaunchModalConfig | null>(null);
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

    setRenderConfig(active);
    setRenderedId(active.id);
    setVisibleId(null);
    timeoutRef.current = setTimeout(() => {
      setVisibleId(active.id);
    }, SHOW_DELAY_MS);

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

  const handleHidden = useCallback(() => {
    setRenderedId(null);
    setRenderConfig(null);
  }, []);

  if (!renderConfig || !renderedId) return null;
  const ModalComponent = renderConfig.component;

  return (
    <ModalComponent
      visible={visibleId === renderedId}
      onDismiss={handleDismiss}
      onHidden={handleHidden}
      ctx={ctx}
    />
  );
}
