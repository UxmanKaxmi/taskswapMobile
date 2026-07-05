// src/features/MyProfile/components/ProfileMenu.tsx

import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert, Linking } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import { spacing, colors } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '@navigation/types/navigation';
import { triggerLogout } from '@shared/api/authBridge';
import Ripple from '@shared/components/Buttons/Ripple';
import { deleteMyAccount } from '../api/MyProfileAPI';
import { showToast } from '@shared/utils/toast';
import { PRIVACY_POLICY_URL, TERMS_URL, SUPPORT_URL } from '@shared/utils/constants';

export type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  iconSet: React.ComponentProps<typeof Icon>['set'];
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Profile menu that takes a dynamic list of items with icons and callbacks.
 */
export default function ProfileMenu() {
  const navigation = useNavigation<AppNavigationProp>();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = useCallback(async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => triggerLogout(),
      },
    ]);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    if (isDeletingAccount) return;

    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and remove your profile from PushMeUp. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeletingAccount(true);
              await deleteMyAccount();
              await triggerLogout({ showToast: false });
              showToast({
                type: 'success',
                title: 'Account deleted',
                message: 'Your account has been removed.',
              });
            } catch {
              setIsDeletingAccount(false);
              showToast({
                type: 'error',
                title: 'Could not delete account',
                message: 'Something went wrong. Please try again.',
              });
            }
          },
        },
      ],
    );
  }, [isDeletingAccount]);

  const primaryItems = useMemo(
    () =>
      [
        {
          label: 'Find Friends',
          icon: 'people-outline',
          onPress: () => {
            navigation.navigate('FindFriendsScreen');
          },
          iconSet: 'ion',
        },
        // {
        //   label: 'Invite Friends',
        //   icon: 'person-add-outline',
        //   onPress: () => {
        //     navigation.navigate('InviteFriendsScreen');
        //   },
        //   iconSet: 'ion',
        // },
        {
          label: 'Blocked Users',
          icon: 'ban-outline',
          onPress: () => {
            navigation.navigate('BlockedUsersScreen');
          },
          iconSet: 'ion',
        },
        {
          label: 'Help Center',
          icon: 'help-circle-outline',
          onPress: () => {
            Linking.openURL(SUPPORT_URL).catch(() => {
              showToast({
                type: 'error',
                title: 'Could not open link',
                message: 'Please try again later.',
              });
            });
          },
          iconSet: 'ion',
        },
        {
          label: 'Send Feedback',
          icon: 'chatbubble-ellipses-outline',
          onPress: () => {
            navigation.navigate('SendFeedbackScreen');
          },
          iconSet: 'ion',
        },
        {
          label: 'Privacy Policy',
          icon: 'shield-checkmark-outline',
          onPress: () => {
            Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
              showToast({
                type: 'error',
                title: 'Could not open link',
                message: 'Please try again later.',
              });
            });
          },
          iconSet: 'ion',
        },
        {
          label: 'Terms of Service',
          icon: 'document-text-outline',
          onPress: () => {
            Linking.openURL(TERMS_URL).catch(() => {
              showToast({
                type: 'error',
                title: 'Could not open link',
                message: 'Please try again later.',
              });
            });
          },
          iconSet: 'ion',
        },
        // {
        //   label: 'Debug Notification',
        //   icon: 'terminal',
        //   onPress: () => navigation.navigate('MainDebugScreen'),
        //   iconSet: 'ion',
        // },
      ] as const,
    [navigation],
  ); // ← keep the literal types

  const dangerItems = useMemo<MenuItem[]>(
    () => [
      {
        id: 'delete-account',
        label: isDeletingAccount ? 'Deleting Account...' : 'Delete Account',
        icon: 'trash-outline',
        onPress: handleDeleteAccount,
        iconSet: 'ion',
        disabled: isDeletingAccount,
        loading: isDeletingAccount,
      },
      {
        id: 'logout',
        label: 'Log Out',
        icon: 'log-out',
        onPress: () => handleLogout(),
        iconSet: 'ion',
      },
    ],
    [handleDeleteAccount, handleLogout, isDeletingAccount],
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {primaryItems.map((item, idx) => (
          <Ripple
            key={item.label}
            style={[styles.row, idx === primaryItems.length - 1 && styles.lastRow]}
            onPress={item.onPress}
          >
            <Row align="center" justify="space-between" style={styles.innerRow}>
              <Row align="center">
                <View style={styles.iconCircle}>
                  <Icon
                    set={item.iconSet}
                    name={item.icon}
                    size={18}
                    color={colors.onboardingInk}
                  />
                </View>
                <TextElement weight="700" style={styles.label}>
                  {item.label}
                </TextElement>
              </Row>
              <Icon set="ion" name="chevron-forward" size={18} color={colors.onboardingMuted} />
            </Row>
          </Ripple>
        ))}
      </View>

      <View style={[styles.card, styles.cardSpacer, styles.dangerCard]}>
        {dangerItems.map((item, idx) => (
          <Ripple
            key={item.id}
            style={[
              styles.row,
              idx === dangerItems.length - 1 && styles.singleRow,
              styles.dangerRow,
              item.disabled && styles.disabledRow,
            ]}
            onPress={item.onPress}
            disabled={item.disabled}
          >
            <Row align="center" justify="space-between" style={styles.innerRow}>
              <Row align="center">
                <View style={[styles.iconCircle, styles.iconCircleDanger]}>
                  {item.loading ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Icon set="ion" name={item.icon} size={20} color={colors.error} />
                  )}
                </View>
                <TextElement variant="body" weight="700" style={[styles.label, styles.labelDanger]}>
                  {item.label}
                </TextElement>
              </Row>
              <Icon set="ion" name="chevron-forward" size={20} color={colors.error} />
            </Row>
          </Ripple>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginTop: 10,
    // paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: ms(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.onboardingLine,
  },
  cardSpacer: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: vs(62),
    paddingVertical: vs(8),
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.onboardingLine,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  singleRow: {
    borderBottomWidth: 0,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(14),
    backgroundColor: '#FFF4D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconCircleDanger: {
    backgroundColor: '#FEECEC',
  },
  label: {
    fontSize: ms(15),
    lineHeight: ms(20),
    color: colors.onboardingInk,
    letterSpacing: 0,
  },
  dangerCard: {
    backgroundColor: '#FFF3F3',
    borderColor: '#F5D6D6',
  },
  dangerRow: {
    backgroundColor: 'transparent',
    borderColor: '#F5D6D6',
  },
  disabledRow: {
    opacity: 0.65,
  },
  labelDanger: {
    color: colors.error,
  },
});
