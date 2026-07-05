import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { LaunchModalProps } from '../launchModals.registry';
import LaunchModalShell from '../components/LaunchModalShell';

export default function AddFriendsModal({ visible, onDismiss, onHidden }: LaunchModalProps) {
  const navigation = useNavigation<any>();

  const handleFindFriends = useCallback(() => {
    onDismiss();
    navigation.navigate('FindFriendsScreen', { openedFromHome: true });
  }, [navigation, onDismiss]);

  return (
    <LaunchModalShell
      visible={visible}
      onDismiss={onDismiss}
      onHidden={onHidden}
      tag="INVITE"
      title={'Find your people'}
      body="Add a few friends who can support your tasks and keep you moving."
      note="BUILD YOUR CREW 💛"
      ctaLabel="Find friends"
      onCtaPress={handleFindFriends}
    />
  );
}
