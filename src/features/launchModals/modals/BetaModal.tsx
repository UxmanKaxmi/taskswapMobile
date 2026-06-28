import React, { useCallback } from 'react';
import type { LaunchModalProps } from '../launchModals.registry';
import LaunchModalShell from '../components/LaunchModalShell';

export default function BetaModal({ visible, onDismiss, onHidden }: LaunchModalProps) {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return (
    <LaunchModalShell
      visible={visible}
      onDismiss={handleDismiss}
      onHidden={onHidden}
      tag="BETA"
      title={'Heads up!\nWe’re in beta.'}
      body="PushMeUp is still growing. You might hit a few rough edges, but that’s where the magic happens. Your feedback helps us build the best community possible."
      note="THANKS FOR BEING EARLY ❤️"
      ctaLabel="Let’s go"
      onCtaPress={handleDismiss}
    />
  );
}
