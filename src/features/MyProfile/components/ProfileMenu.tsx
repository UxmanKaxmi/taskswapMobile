// src/features/MyProfile/components/ProfileMenu.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import { spacing, ThemeColors, ThemePreference, useTheme, useThemedStyles } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '@navigation/types/navigation';
import { triggerLogout } from '@shared/api/authBridge';
import Ripple from '@shared/components/Buttons/Ripple';
import { deleteMyAccount } from '../api/MyProfileAPI';
import { showToast } from '@shared/utils/toast';
import { SUPPORT_URL } from '@shared/utils/constants';
import AppModal from '@shared/components/AppModal/AppModal';
import { MODAL_TOP_RADIUS } from '@shared/constants/modal';

type ThemeOption = {
  value: ThemePreference;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Icon>['name'];
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Use the bright PushMeUp look.',
    icon: 'sunny-outline',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Use the darker interface.',
    icon: 'moon-outline',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match your device appearance.',
    icon: 'phone-portrait-outline',
  },
];

export type MenuItem = {
  id?: string;
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  iconSet: React.ComponentProps<typeof Icon>['set'];
  valueLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'warm' | 'neutral' | 'danger';
};

type MenuSection = {
  label: string;
  items: MenuItem[];
};

/**
 * Grouped profile menu: labeled section cards of rows with icon tiles.
 */
export default function ProfileMenu() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<AppNavigationProp>();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [themeSheetVisible, setThemeSheetVisible] = useState(false);
  const themeSheetTranslateY = useRef(new Animated.Value(320)).current;
  const activeThemeOption =
    THEME_OPTIONS.find(option => option.value === preference) ?? THEME_OPTIONS[2];

  useEffect(() => {
    Animated.timing(themeSheetTranslateY, {
      toValue: themeSheetVisible ? 0 : 320,
      duration: themeSheetVisible ? 220 : 180,
      useNativeDriver: true,
    }).start();
  }, [themeSheetTranslateY, themeSheetVisible]);

  const closeThemeSheet = useCallback(() => {
    setThemeSheetVisible(false);
  }, []);

  const handleThemeSelect = useCallback(
    (nextPreference: ThemePreference) => {
      setPreference(nextPreference);
      closeThemeSheet();
    },
    [closeThemeSheet, setPreference],
  );

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

  // TODO: Add a "Your tasks" row (flag icon + "N active" pill) above PEOPLE
  // once an owned-task-list route and an active-task count source exist.
  // There is currently no screen for the user's own task list — do not link
  // this to the Home feed or FriendsProfileScreen.
  const sections = useMemo<MenuSection[]>(
    () => [
      {
        label: 'YOU',
        items: [
          {
            label: 'Your Impact',
            icon: 'sparkles-outline',
            onPress: () => {
              navigation.navigate('YourImpactScreen');
            },
            iconSet: 'ion',
          },
        ],
      },
      {
        label: 'PEOPLE',
        items: [
          {
            label: 'Find Friends',
            icon: 'people-outline',
            onPress: () => {
              navigation.navigate('FindFriendsScreen');
            },
            iconSet: 'ion',
          },
          {
            label: 'Blocked Users',
            icon: 'ban-outline',
            onPress: () => {
              navigation.navigate('BlockedUsersScreen');
            },
            iconSet: 'ion',
          },
        ],
      },
      {
        label: 'APP',
        items: [
          {
            label: 'Appearance',
            icon: 'color-palette-outline',
            onPress: () => {
              setThemeSheetVisible(true);
            },
            iconSet: 'ion',
            valueLabel: activeThemeOption.label,
          },
        ],
      },
      {
        label: 'SUPPORT',
        items: [
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
        ],
      },
      {
        label: 'ACCOUNT',
        items: [
          {
            id: 'logout',
            label: 'Log Out',
            icon: 'log-out-outline',
            onPress: () => handleLogout(),
            iconSet: 'ion',
            tone: 'neutral',
          },
          {
            id: 'delete-account',
            label: isDeletingAccount ? 'Deleting Account...' : 'Delete Account',
            icon: 'trash-outline',
            onPress: handleDeleteAccount,
            iconSet: 'ion',
            disabled: isDeletingAccount,
            loading: isDeletingAccount,
            tone: 'danger',
          },
        ],
      },
    ],
    [activeThemeOption.label, handleDeleteAccount, handleLogout, isDeletingAccount, navigation],
  );

  const renderItem = (item: MenuItem, isLast: boolean) => {
    const isDanger = item.tone === 'danger';
    const isNeutral = item.tone === 'neutral';
    const iconColor = isDanger
      ? colors.error
      : isNeutral
        ? colors.onboardingInkSoft
        : colors.onboardingInk;

    return (
      <Ripple
        key={item.id ?? item.label}
        style={[styles.row, isLast && styles.lastRow, item.disabled && styles.disabledRow]}
        onPress={item.onPress}
        disabled={item.disabled}
      >
        <Row align="center" justify="space-between" style={styles.innerRow}>
          <Row align="center">
            <View
              style={[
                styles.iconTile,
                isNeutral && styles.iconTileNeutral,
                isDanger && styles.iconTileDanger,
              ]}
            >
              {item.loading ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Icon set={item.iconSet} name={item.icon} size={17} color={iconColor} />
              )}
            </View>
            <TextElement weight="700" style={[styles.label, isDanger && styles.labelDanger]}>
              {item.label}
            </TextElement>
          </Row>
          <Row align="center" style={styles.rowAccessory}>
            {!!item.valueLabel && (
              <TextElement style={styles.valueLabel}>{item.valueLabel}</TextElement>
            )}
            <Icon
              set="ion"
              name="chevron-forward"
              size={16}
              color={isDanger ? colors.error : colors.onboardingMuted}
            />
          </Row>
        </Row>
      </Ripple>
    );
  };

  return (
    <View style={styles.container}>
      {sections.map(section => (
        <View key={section.label}>
          <TextElement variant="overline" weight="700" style={styles.sectionLabel}>
            {section.label}
          </TextElement>
          <View style={styles.card}>
            {section.items.map((item, idx) => renderItem(item, idx === section.items.length - 1))}
          </View>
        </View>
      ))}

      <AppModal
        visible={themeSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={closeThemeSheet}
      >
        <TouchableWithoutFeedback onPress={closeThemeSheet}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: themeSheetTranslateY }] }]}
        >
          <View style={styles.sheetHeader}>
            <TextElement style={styles.sheetTitle}>Choose appearance</TextElement>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={closeThemeSheet}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Icon set="ion" name="close" size={ms(20)} color={colors.onboardingInk} />
            </Pressable>
          </View>

          <View style={styles.optionList}>
            {THEME_OPTIONS.map(option => {
              const selected = option.value === preference;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => handleThemeSelect(option.value)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.selectedOptionRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.optionIcon}>
                    <Icon set="ion" name={option.icon} size={ms(17)} color={colors.onboardingInk} />
                  </View>
                  <View style={styles.optionTextBlock}>
                    <TextElement style={styles.optionTitle}>{option.label}</TextElement>
                    <TextElement style={styles.optionDescription}>{option.description}</TextElement>
                  </View>
                  {selected ? (
                    <Icon
                      set="ion"
                      name="checkmark-sharp"
                      size={ms(22)}
                      color={colors.onboardingInk}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </AppModal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {},
    sectionLabel: {
      color: colors.onboardingMuted,
      fontSize: ms(10),
      lineHeight: ms(13),
      letterSpacing: 0.6,
      marginTop: vs(14),
      marginBottom: vs(6),
      marginHorizontal: ms(6),
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: ms(16),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.onboardingLine,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: vs(11),
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.onboardingLine,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    innerRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rowAccessory: {
      flexShrink: 0,
    },
    iconTile: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(10),
      backgroundColor: colors.warmIconChipBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    iconTileNeutral: {
      backgroundColor: colors.onboardingLine,
    },
    iconTileDanger: {
      backgroundColor: colors.dangerIconChipBg,
    },
    label: {
      fontSize: ms(15),
      lineHeight: ms(20),
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    valueLabel: {
      color: colors.onboardingMuted,
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '700',
      marginRight: ms(6),
    },
    disabledRow: {
      opacity: 0.65,
    },
    labelDanger: {
      color: colors.error,
    },
    pressed: {
      opacity: 0.78,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.52)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.onboardingPaper,
      borderTopLeftRadius: MODAL_TOP_RADIUS,
      borderTopRightRadius: MODAL_TOP_RADIUS,
      paddingTop: spacing.md,
      paddingBottom: vs(34),
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
    },
    sheetTitle: {
      color: colors.onboardingInk,
      fontSize: ms(19),
      lineHeight: ms(24),
      fontWeight: '900',
    },
    closeButton: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onboardingLine,
    },
    optionList: {
      marginTop: spacing.xs,
    },
    optionRow: {
      minHeight: vs(58),
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    selectedOptionRow: {
      backgroundColor: 'rgba(255, 210, 63, 0.18)',
      borderLeftColor: colors.onboardingPush,
    },
    optionIcon: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionTextBlock: {
      flex: 1,
    },
    optionTitle: {
      color: colors.onboardingInk,
      fontSize: ms(15),
      lineHeight: ms(19),
      fontWeight: '800',
    },
    optionDescription: {
      marginTop: vs(3),
      color: colors.onboardingMuted,
      fontSize: ms(12),
      lineHeight: ms(15),
      fontWeight: '600',
    },
  });
