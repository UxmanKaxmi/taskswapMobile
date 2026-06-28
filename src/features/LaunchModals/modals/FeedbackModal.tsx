import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { LaunchModalProps } from '../launchModals.registry';
import LaunchModalShell from '../components/LaunchModalShell';
import { ms } from 'react-native-size-matters';

export default function FeedbackModal({ visible, onDismiss, onHidden }: LaunchModalProps) {
  const navigation = useNavigation<any>();

  const handleGiveFeedback = useCallback(() => {
    onDismiss();
    navigation.navigate('SendFeedbackScreen');
  }, [navigation, onDismiss]);

  return (
    <LaunchModalShell
      visible={visible}
      onDismiss={onDismiss}
      onHidden={onHidden}
      tag="FEEDBACK"
      title={'Got a sec?'}
      body="Tell us what felt useful, confusing, or missing. It helps us make PushMeUp better."
      note="WE READ EVERY NOTE 💛"
      ctaLabel="Send feedback"
      onCtaPress={handleGiveFeedback}
      minWidth={ms(80)}
    />
  );
}
