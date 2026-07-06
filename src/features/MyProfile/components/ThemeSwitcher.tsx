// src/features/MyProfile/components/ThemeSwitcher.tsx

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import { spacing, ThemeColors, ThemePreference, useTheme, useThemedStyles } from '@shared/theme';

type ThemeOption = {
  value: ThemePreference;
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
};

const OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

/**
 * Appearance card for the settings screen: pick Light, Dark, or System.
 */
export default function ThemeSwitcher() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <Row align="center" style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Icon set="ion" name="color-palette-outline" size={18} color={colors.onboardingInk} />
        </View>
        <TextElement weight="700" style={styles.title}>
          Appearance
        </TextElement>
      </Row>

      <View style={styles.segmentTrack}>
        {OPTIONS.map(option => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Use ${option.label.toLowerCase()} theme`}
              onPress={() => setPreference(option.value)}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              <Icon
                set="ion"
                name={option.icon}
                size={16}
                color={selected ? colors.tactileMomentumSecondary : colors.onboardingMuted}
              />
              <TextElement
                weight={selected ? '700' : '500'}
                style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}
              >
                {option.label}
              </TextElement>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: ms(20),
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      paddingHorizontal: spacing.lg,
      paddingVertical: vs(12),
      marginBottom: spacing.md,
    },
    headerRow: {
      marginBottom: vs(10),
    },
    iconCircle: {
      width: ms(42),
      height: ms(42),
      borderRadius: ms(14),
      backgroundColor: colors.warmIconChipBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    title: {
      fontSize: ms(15),
      lineHeight: ms(20),
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    segmentTrack: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: ms(14),
      padding: ms(4),
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(6),
      paddingVertical: vs(8),
      borderRadius: ms(11),
    },
    segmentSelected: {
      backgroundColor: colors.onboardingPush,
    },
    segmentLabel: {
      fontSize: ms(13),
      color: colors.onboardingMuted,
    },
    segmentLabelSelected: {
      color: colors.tactileMomentumSecondary,
    },
  });
