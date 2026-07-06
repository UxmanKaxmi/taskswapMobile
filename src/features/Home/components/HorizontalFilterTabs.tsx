import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import AppModal from '@shared/components/AppModal/AppModal';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { MODAL_TOP_RADIUS } from '@shared/constants/modal';

export type FeedSortKey = 'all' | 'needs_push' | 'new' | 'almost_there';

type FeedSortOption = {
  key: FeedSortKey;
  label: string;
  description: string;
  icon: string;
};

const FEED_SORT_OPTIONS: FeedSortOption[] = [
  {
    key: 'all',
    label: 'All',
    description: 'Show every active motivation.',
    icon: 'list',
  },
  {
    key: 'needs_push',
    label: 'Needs a push',
    description: 'Low or zero pushes first.',
    icon: 'sliders',
  },
  {
    key: 'new',
    label: 'New',
    description: 'Latest motivation posts first.',
    icon: 'clock-rotate-left',
  },
  {
    key: 'almost_there',
    label: 'Almost there',
    description: 'Posts with momentum that need one more nudge.',
    icon: 'rocket',
  },
];

type Props = {
  value: FeedSortKey;
  onChange: (key: FeedSortKey) => void;
  /** Render a compact circular icon-only trigger (no label text). */
  iconOnly?: boolean;
};

export default function HorizontalFilterTabs({ value, onChange, iconOnly = false }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(320)).current;
  const activeOption =
    FEED_SORT_OPTIONS.find(option => option.key === value) ?? FEED_SORT_OPTIONS[0];

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 320,
      duration: visible ? 220 : 180,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  const closeSheet = useCallback(() => {
    setVisible(false);
  }, []);

  const handleSelect = useCallback(
    (key: FeedSortKey) => {
      onChange(key);
      closeSheet();
    },
    [closeSheet, onChange],
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Feed options"
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          iconOnly ? styles.iconButton : styles.button,
          pressed && styles.pressed,
        ]}
      >
        <Icon
          set="fa6"
          name="sliders"
          iconStyle="solid"
          size={ms(18)}
          color={colors.onboardingInk}
        />
        {!iconOnly && (
          <>
            <TextElement style={styles.buttonText}>Feed options</TextElement>
            <TextElement style={styles.buttonValue}>{activeOption.label}</TextElement>
          </>
        )}
      </Pressable>

      <AppModal visible={visible} transparent animationType="fade" onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHeader}>
            <TextElement style={styles.sheetTitle}>Sort feed by</TextElement>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={closeSheet}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Icon set="ion" name="close" size={ms(20)} color={colors.onboardingInk} />
            </Pressable>
          </View>

          <View style={styles.optionList}>
            {FEED_SORT_OPTIONS.map(option => {
              const selected = option.key === value;

              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  onPress={() => handleSelect(option.key)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.selectedOptionRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.optionIcon}>
                    <Icon
                      set="fa6"
                      name={option.icon}
                      iconStyle="solid"
                      size={ms(15)}
                      color={colors.onboardingInk}
                    />
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
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
      paddingHorizontal: ms(16),
      paddingVertical: vs(8),
      borderRadius: 999,
      backgroundColor: colors.onboardingPaper,
      borderWidth: 1,
      borderColor: colors.onboardingMuted,
    },
    iconButton: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onboardingPaper,
    },
    pressed: {
      opacity: 0.78,
    },
    buttonText: {
      color: colors.onboardingInk,
      fontSize: ms(14),
      lineHeight: ms(17),
      fontWeight: '800',
    },
    buttonValue: {
      color: colors.onboardingMuted,
      fontSize: ms(12),
      lineHeight: ms(15),
      fontWeight: '700',
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
    handle: {
      alignSelf: 'center',
      width: ms(40),
      height: vs(5),
      borderRadius: 999,
      marginBottom: spacing.md,
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
      letterSpacing: -0.4,
    },
    closeButton: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onboardingLine,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: spacing.lg,
      // marginTop: spacing.md,
      backgroundColor: colors.onboardingLine,
    },
    optionList: {
      marginTop: spacing.xs,
    },
    optionRow: {
      minHeight: vs(54),
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      // Reserve the accent-bar width on every row so the selected state doesn't
      // nudge content sideways.
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
