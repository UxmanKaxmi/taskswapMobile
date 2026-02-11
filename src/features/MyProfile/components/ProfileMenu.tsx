// src/features/MyProfile/components/ProfileMenu.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import { spacing, colors, typography } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import { useAuth } from '@features/Auth/AuthProvider';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppNavigationProp, MainStackParamList } from '@navigation/types/navigation';
import { triggerLogout } from '@shared/api/authBridge';
import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { APP_ENV, isDEV } from '@shared/utils/constants';
import Ripple from '@shared/components/Buttons/Ripple';
import { resetAllLaunchModalsSeen } from '@features/launchModals/launchModals.storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  iconSet: React.ComponentProps<typeof Icon>['set'];
};

type Props = {};

/**
 * Profile menu that takes a dynamic list of items with icons and callbacks.
 */
export default function ProfileMenu() {
  const navigation = useNavigation<AppNavigationProp>();
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => triggerLogout(),
      },
    ]);
  };
  const handleResetAppData = async () => {
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
  };
  const primaryItems = [
    {
      label: 'Find Friends',
      icon: 'people-sharp',
      onPress: () => {
        navigation.navigate('FindFriendsScreen');
      },
      iconSet: 'ion',
    },
    {
      label: 'Invite Friends',
      icon: 'person-add-sharp',
      onPress: () => {
        navigation.navigate('InviteFriendsScreen');
      },
      iconSet: 'ion',
    },
    {
      label: 'Help Center',
      icon: 'information-circle-sharp',
      onPress: () => {
        /* go to help  */
      },
      iconSet: 'ion',
    },
  ] as const; // ← keep the literal types

  const secondaryItems = [
    {
      label: 'Reset Launch Modals',
      icon: 'refresh',
      onPress: async () => await resetAllLaunchModalsSeen(),
      iconSet: 'ion',
    },
    {
      label: 'Debug Notification',
      icon: 'terminal',
      onPress: () => navigation.navigate('MainDebugScreen'),
      iconSet: 'ion',
    },
    ...(APP_ENV !== 'production'
      ? [
          {
            label: 'Reset App Data',
            icon: 'trash',
            onPress: () => handleResetAppData(),
            iconSet: 'ion',
          },
        ]
      : []),
  ] as const;

  const dangerItems = [
    {
      label: 'Log Out',
      icon: 'log-out',
      onPress: () => handleLogout(),
      iconSet: 'ion',
    },
  ] as const;

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
                  <Icon set={item.iconSet} name={item.icon} size={20} color={colors.primary} />
                </View>
                <TextElement variant="body" weight="600" style={styles.label}>
                  {item.label}
                </TextElement>
              </Row>
              <Icon set="ion" name="chevron-forward" size={20} color={colors.muted} />
            </Row>
          </Ripple>
        ))}
      </View>

      {isDEV && (
        <View style={[styles.card, styles.cardSpacer]}>
          {secondaryItems.map(item => (
            <Ripple key={item.label} style={[styles.row, styles.singleRow]} onPress={item.onPress}>
              <Row align="center" justify="space-between" style={styles.innerRow}>
                <Row align="center">
                  <View style={[styles.iconCircle, styles.iconCircleMuted]}>
                    <Icon set={item.iconSet} name={item.icon} size={20} color={colors.muted} />
                  </View>
                  <TextElement
                    variant="body"
                    weight="600"
                    style={[styles.label, styles.labelMuted]}
                  >
                    {item.label}
                  </TextElement>
                </Row>
                <Icon set="ion" name="chevron-forward" size={20} color={colors.border} />
              </Row>
            </Ripple>
          ))}
        </View>
      )}

      <View style={[styles.card, styles.cardSpacer, styles.dangerCard]}>
        {dangerItems.map(item => (
          <Ripple
            key={item.label}
            style={[styles.row, styles.singleRow, styles.dangerRow]}
            onPress={item.onPress}
          >
            <Row align="center" justify="space-between" style={styles.innerRow}>
              <Row align="center">
                <View style={[styles.iconCircle, styles.iconCircleDanger]}>
                  <Icon set="ion" name={item.icon} size={20} color={colors.error} />
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardSpacer: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(10),
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.adviceBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconCircleMuted: {
    backgroundColor: colors.background,
  },
  iconCircleDanger: {
    backgroundColor: '#FEECEC',
  },
  label: {
    fontSize: ms(15),
    color: colors.text,
    marginLeft: -spacing.sm,
  },
  labelMuted: {
    color: colors.muted,
  },
  dangerCard: {
    backgroundColor: '#FFF3F3',
    borderColor: '#F5D6D6',
  },
  dangerRow: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  labelDanger: {
    color: colors.error,
  },
});
