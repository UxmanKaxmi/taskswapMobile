import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import type { ReportReason } from '@features/Reports';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Ripple from '@shared/components/Buttons/Ripple';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import type { ReportTaskModalPayload } from '../modalTypes';

type Props = {
  payload: ReportTaskModalPayload;
  closeModal: () => void;
};

const REPORT_REASONS: Array<{ label: string; value: ReportReason }> = [
  { label: 'Harassment or bullying', value: 'harassment' },
  { label: 'Hate or abusive content', value: 'hate_or_abuse' },
  { label: 'Sexual content', value: 'sexual_content' },
  { label: 'Scam or spam', value: 'spam_or_scam' },
  { label: 'Self-harm or danger', value: 'self_harm_or_danger' },
  { label: 'Other', value: 'other' },
];

export default function ReportTaskModalContent({ payload, closeModal }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedReason(null);
    setIsSubmitting(false);
  }, [payload]);

  const canSubmit = useMemo(
    () => Boolean(selectedReason) && !isSubmitting,
    [selectedReason, isSubmitting],
  );

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(payload.onSubmit(selectedReason));
      closeModal();
    } catch {
      // Caller owns user-visible error handling.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon set="ion" name="flag-outline" size={ms(26)} color={colors.error} />
      </View>

      <TextElement variant="headline" weight="700" style={styles.title}>
        Report task
      </TextElement>

      <TextElement variant="bodySmall" color="muted" style={styles.subtitle}>
        Tell us what is wrong. Reports are reviewed by our team.
      </TextElement>

      <View style={styles.quoteCard}>
        {!!payload.ownerName && (
          <TextElement style={styles.ownerText}>{payload.ownerName}</TextElement>
        )}
        <TextElement numberOfLines={3} style={styles.quoteText}>
          "{payload.taskText}"
        </TextElement>
      </View>

      <View style={styles.reasonList}>
        {REPORT_REASONS.map(reason => {
          const selected = selectedReason === reason.value;

          return (
            <Ripple
              key={reason.value}
              style={[styles.reasonRow, selected && styles.reasonRowSelected]}
              onPress={() => setSelectedReason(reason.value)}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
              <TextElement style={[styles.reasonText, selected && styles.reasonTextSelected]}>
                {reason.label}
              </TextElement>
            </Ripple>
          );
        })}
      </View>

      <PrimaryButton
        title="Submit report"
        onPress={handleSubmit}
        disabled={!canSubmit}
        isLoading={isSubmitting}
        backgroundColor={canSubmit ? colors.error : colors.disabled}
        style={styles.button}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.sm,
    },
    iconWrap: {
      width: ms(44),
      height: ms(44),
      borderRadius: ms(22),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.dangerIconChipBg,
      marginTop: vs(2),
      marginBottom: vs(8),
    },
    title: {
      textAlign: 'center',
      fontSize: ms(24),
      lineHeight: ms(29),
    },
    subtitle: {
      textAlign: 'center',
      marginTop: vs(4),
      marginBottom: vs(10),
    },
    quoteCard: {
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      backgroundColor: colors.onboardingPaper,
      borderRadius: ms(12),
      paddingVertical: vs(10),
      paddingHorizontal: spacing.md,
      marginBottom: vs(10),
    },
    ownerText: {
      color: colors.muted,
      fontSize: ms(12),
      fontWeight: '700',
      marginBottom: vs(4),
    },
    quoteText: {
      color: colors.text,
      fontSize: ms(14),
      lineHeight: ms(18),
    },
    reasonList: {
      gap: vs(6),
      marginBottom: vs(10),
    },
    reasonRow: {
      minHeight: vs(40),
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    reasonRowSelected: {
      borderColor: colors.error,
      backgroundColor: colors.dangerSoftBg,
    },
    radio: {
      width: ms(18),
      height: ms(18),
      borderRadius: ms(9),
      borderWidth: 1,
      borderColor: colors.placeHolder,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    radioSelected: {
      borderColor: colors.error,
    },
    radioDot: {
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      backgroundColor: colors.error,
    },
    reasonText: {
      flex: 1,
      color: colors.text,
      fontSize: ms(14),
      fontWeight: '600',
    },
    reasonTextSelected: {
      color: colors.onboardingInk,
    },
    button: {
      width: '100%',
      alignSelf: 'stretch',
      marginTop: vs(2),
    },
  });
