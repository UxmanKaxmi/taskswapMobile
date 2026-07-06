import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, type ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { CHEER_PRESETS } from '@features/Goals/constants/cheerPresets';
import type { CheerModalPayload } from '../modalTypes';

const ACTIVE_CHEER_PRESET_LIMIT = 6;

type Props = {
  payload: CheerModalPayload;
  closeModal: () => void;
};

export default function CheerModalContent({ payload, closeModal }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const contextText = compactContextText(payload.taskText);
  const visiblePresets = CHEER_PRESETS.slice(0, ACTIVE_CHEER_PRESET_LIMIT);

  useEffect(() => {
    setSubmittingKey(null);
  }, [payload]);

  const handleSelect = async (presetKey: string) => {
    if (submittingKey) return;

    try {
      setSubmittingKey(presetKey);
      await Promise.resolve(payload.onSelectPreset(presetKey));
      closeModal();
    } catch {
      // Caller owns user-visible error handling.
    } finally {
      setSubmittingKey(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerIcon}>
        <Icon set="ion" name="sparkles" size={ms(16)} color={colors.tactileMomentumSecondary} />
      </View>

      <TextElement style={styles.title}>Send a cheer</TextElement>
      <TextElement style={styles.subtitle}>Pick a few words of encouragement</TextElement>

      {contextText ? (
        <View style={styles.contextChip}>
          {/* <Icon set="ion" name="flag-outline" size={ms(12)} color={colors.onboardingMuted} /> */}
          <TextElement style={styles.contextText}>
            {payload.ownerName} · {contextText}
          </TextElement>
        </View>
      ) : null}

      <View style={styles.list}>
        {visiblePresets.map(preset => {
          const isSubmitting = submittingKey === preset.key;
          return (
            <Ripple
              key={preset.key}
              radius={12}
              disabled={Boolean(submittingKey)}
              onPress={() => handleSelect(preset.key)}
              style={[styles.row, isSubmitting && styles.rowSubmitting]}
            >
              <View style={styles.rowIcon}>
                <Icon set="ion" name="sparkles" size={ms(13)} color={colors.onboardingPushDeep} />
              </View>
              <TextElement style={styles.rowText}>{preset.text}</TextElement>
              <Icon set="ion" name="chevron-forward" size={ms(16)} color={colors.onboardingMuted} />
            </Ripple>
          );
        })}

        <View style={styles.disabledRow}>
          <View style={[styles.rowIcon, styles.disabledIcon]}>
            <Icon set="ion" name="create-outline" size={ms(13)} color={colors.onboardingMuted} />
          </View>
          <TextElement style={styles.disabledText}>Write your own</TextElement>
          <TextElement style={styles.comingSoonText}>Coming soon</TextElement>
        </View>
      </View>
    </View>
  );
}

function compactContextText(text?: string) {
  return text
    ?.trim()
    .replace(/^["“]+/, '')
    .replace(/["”]+$/, '')
    .replace(/\s+/g, ' ');
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.md,
    },
    headerIcon: {
      width: ms(36),
      height: ms(36),
      borderRadius: ms(18),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: vs(1),
    },
    title: {
      marginTop: vs(8),
      fontSize: ms(23),
      lineHeight: ms(27),
      fontWeight: '800',
      color: colors.onboardingInk,
      textAlign: 'center',
    },
    subtitle: {
      marginTop: vs(5),
      fontSize: ms(13),
      lineHeight: ms(18),
      color: colors.onboardingMuted,
      textAlign: 'center',
    },
    contextChip: {
      marginTop: vs(12),
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: ms(12),
      paddingVertical: vs(8),
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(7),
    },
    contextText: {
      flex: 1,
      fontSize: ms(12),
      lineHeight: ms(16),
      color: colors.onboardingInkSoft,
      fontWeight: '600',
    },
    list: {
      marginTop: vs(14),
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 0,
      borderColor: colors.onboardingLine,
      backgroundColor: colors.onboardingCard,
    },
    row: {
      minHeight: vs(50),
      paddingHorizontal: spacing.md,
      paddingVertical: vs(9),
      backgroundColor: colors.onboardingCard,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.onboardingLine,
    },
    rowSubmitting: {
      opacity: 0.68,
    },
    rowIcon: {
      width: ms(24),
      height: ms(24),
      borderRadius: ms(12),
      backgroundColor: 'rgba(255, 210, 63, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    rowText: {
      flex: 1,
      fontSize: ms(15),
      lineHeight: ms(20),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    disabledRow: {
      minHeight: vs(42),
      paddingHorizontal: spacing.md,
      paddingVertical: vs(9),
      backgroundColor: colors.inputBackground,
      flexDirection: 'row',
      alignItems: 'center',
    },
    disabledIcon: {
      backgroundColor: 'transparent',
    },
    disabledText: {
      flex: 1,
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '600',
      color: colors.onboardingMuted,
    },
    comingSoonText: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '700',
      color: colors.onboardingMuted,
    },
  });
