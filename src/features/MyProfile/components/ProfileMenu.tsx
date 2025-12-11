// src/features/MyProfile/components/ProfileMenu.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import { spacing, colors, typography } from '@shared/theme';
import { useAuth } from '@features/Auth/AuthProvider';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppNavigationProp, MainStackParamList } from '@navigation/types/navigation';
import { triggerLogout } from '@shared/api/authBridge';

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
  const menuItems = [
    {
      label: 'Find your friends..',
      icon: 'people-circle',
      onPress: () => {
        navigation.navigate('FindFriendsScreen');
      },
      iconSet: 'ion',
    },
    {
      label: 'Saved Tasks',
      icon: 'bookmark',
      onPress: () => {
        /* go to saved */
      },
      iconSet: 'ion',
    },
    {
      label: 'Invite Friends',
      icon: 'people-group',
      onPress: () => {
        navigation.navigate('InviteFriendsScreen');
      },
      iconSet: 'fa6',
    },
    {
      label: 'Help Center',
      icon: 'help-circle',
      onPress: () => {
        /* go to help  */
      },
      iconSet: 'ion',
    },
    {
      label: 'Debug Notification',
      icon: 'arrow-down-left-box-outline',
      onPress: () => navigation.navigate('MainDebugScreen'),
      iconSet: 'ion',
    },

    {
      label: 'Log Out',
      icon: 'log-out',
      onPress: () => handleLogout(),
      iconSet: 'ion',
    },
  ] as const; // ← keep the literal types

  return (
    <View style={styles.container}>
      {menuItems.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.row, idx === menuItems.length - 1 && styles.lastRow]}
          activeOpacity={0.7}
          onPress={item.onPress}
        >
          <Row align="center" justify="space-between" style={styles.innerRow}>
            <Row align="center">
              {/* Render Icon only if the set is supported */}
              {item.iconSet === 'fa6' ? (
                <Icon
                  set="fa6"
                  name={item.icon}
                  size={20}
                  color={colors.primary}
                  style={styles.icon}
                  iconStyle="solid"
                />
              ) : item.iconSet === 'ion' ? (
                <Icon
                  set="ion"
                  name={item.icon}
                  size={20}
                  color={colors.primary}
                  style={styles.icon}
                />
              ) : null}
              <TextElement variant="body" weight="500" style={styles.label}>
                {item.label}
              </TextElement>
            </Row>
            <Icon set="ion" name="chevron-forward" size={20} color={colors.primary} />
          </Row>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    // marginVertical: spacing.md,
    // marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    overflow: 'hidden',
    paddingHorizontal: 0,
    // subtle shadow
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: spacing.md,
  },
  label: {
    fontSize: typography.subtitle,
    color: colors.text,
  },
});
