// src/features/MyProfile/components/StatsAchievements.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { spacing, ThemeColors, useThemedStyles } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';

export type StatsAchievementsProps = {
  pushesGiven: number;
  tasksDone: number;
  dayStreak: number;
};

export default function StatsAchievements({
  pushesGiven,
  tasksDone,
  dayStreak,
}: StatsAchievementsProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <Row style={styles.statsRow}>
        <View style={styles.statItem}>
          <TextElement weight="800" style={[styles.statNumber, styles.pushesNumber]}>
            {pushesGiven}
          </TextElement>
          <TextElement style={styles.statLabel}>PUSHES GIVEN</TextElement>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <TextElement weight="800" style={styles.statNumber}>
            {tasksDone}
          </TextElement>
          <TextElement style={styles.statLabel}>TASKS DONE</TextElement>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <TextElement weight="800" style={styles.statNumber}>
            {dayStreak}
          </TextElement>
          <TextElement style={styles.statLabel}>DAY STREAK</TextElement>
        </View>
      </Row>
      {pushesGiven === 0 && (
        <TextElement variant="caption" style={styles.zeroState}>
          Every push is a real person. Give your first.
        </TextElement>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: ms(20),
      paddingVertical: vs(12),
      paddingHorizontal: spacing.md,
      marginTop: vs(14),
      marginBottom: vs(18),
      borderWidth: 1,
      borderColor: colors.onboardingLine,
    },
    statsRow: {
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      color: colors.onboardingInk,
      marginBottom: vs(5),
      fontSize: ms(22),
      lineHeight: ms(27),
    },
    pushesNumber: {
      color: colors.onboardingPushDeep,
    },
    statLabel: {
      color: colors.onboardingMuted,
      letterSpacing: 0.7,
      fontSize: ms(9),
      lineHeight: ms(13),
    },
    divider: {
      width: 1,
      height: vs(34),
      backgroundColor: colors.onboardingLine,
    },
    zeroState: {
      marginTop: vs(10),
      textAlign: 'center',
      color: colors.onboardingMuted,
    },
  });
