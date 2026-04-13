import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerLogout } from '@shared/api/authBridge';
import { resetAllLaunchModalsSeen } from '@features/LaunchModals/launchModals.storage';

export type SecondaryProfileMenuItem = {
  label: string;
  icon: 'refresh' | 'trash';
  iconSet: 'ion';
  destructive?: boolean;
  onPress: () => void;
};

export function useSecondaryProfileMenuItems() {
  const handleResetAppData = useCallback(() => {
    Alert.alert('Reset App', 'This will clear all data and sign you out. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await triggerLogout();
          await AsyncStorage.clear();
        },
      },
    ]);
  }, []);

  return useMemo<SecondaryProfileMenuItem[]>(
    () => [
      {
        label: 'Reset Launch Modals',
        icon: 'refresh',
        iconSet: 'ion',
        onPress: () => {
          void resetAllLaunchModalsSeen();
        },
      },
      {
        label: 'Reset App Data',
        icon: 'trash',
        iconSet: 'ion',
        destructive: true,
        onPress: handleResetAppData,
      },
    ],
    [handleResetAppData],
  );
}
