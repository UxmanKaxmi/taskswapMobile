// src/features/MyProfile/components/ProfileMenu.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import { spacing, colors, typography } from '@shared/theme';
import { useAuth } from '@features/Auth/authProvider';

export type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  onPress: () => void;
};

type Props = {
  items: MenuItem[];
};

/**
 * Profile menu that takes a dynamic list of items with icons and callbacks.
 */
export default function ProfileMenu({ items }: Props) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => signOut(),
      },
    ]);
  };
  const menuItems = [
    // {
    //   label: 'Settings',
    //   icon: 'settings',
    //   onPress: () => {
    //     /* go to settings */
    //   },
    // },
    {
      label: 'Saved Tasks',
      icon: 'bookmark',
      onPress: () => {
        /* go to saved */
      },
    },
    {
      label: 'Billing',
      icon: 'card',
      onPress: () => {
        /* go to billing*/
      },
    },
    {
      label: 'Help Center',
      icon: 'help-circle',
      onPress: () => {
        /* go to help  */
      },
    },
    {
      label: 'Log Out',
      icon: 'log-out',
      onPress: () => handleLogout(),
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
              <Icon
                set="ion"
                name={item.icon}
                size={20}
                color={colors.primary}
                style={styles.icon}
              />
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
    // subtle shadow
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
    alignItems: 'center',
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
