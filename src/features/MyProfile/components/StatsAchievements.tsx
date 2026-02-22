// src/features/MyProfile/components/StatsAchievements.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { spacing, colors, typography } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';

export type StatsAchievementsProps = {
  // karmaPoints: number;
  tasksDone: number;
  dayStreak: number;
  taskSuccessRate: number;
  // achievements?: {
  //   icon: React.ComponentProps<typeof Icon>['name'];
  //   label: string;
  // }[];
};

export default function StatsAchievements({
  // karmaPoints,
  tasksDone,
  dayStreak,
  taskSuccessRate,
  // achievements = [
  //   { icon: 'trophy', label: 'Super Helper' },
  //   { icon: 'fire', label: '7 Day Streak' },
  //   { icon: 'star', label: 'Top Rated' },
  // ],
}: StatsAchievementsProps) {
  return (
    <View style={styles.card}>
      {/* <TextElement variant="subtitle" weight="600" style={styles.header}>
        Statistics
      </TextElement> */}

      {/* Stats Row */}
      <Row style={styles.statsRow}>
        <View style={[styles.statItem, { flex: 1.2 }]}>
          <TextElement variant="title" weight="700" style={styles.statNumber}>
            {taskSuccessRate}%
          </TextElement>
          <TextElement variant="caption" style={styles.statLabel}>
            Task Success
          </TextElement>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <TextElement variant="title" weight="700" style={styles.statNumber}>
            {tasksDone}
          </TextElement>
          <TextElement variant="caption" style={styles.statLabel}>
            Tasks Done
          </TextElement>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <TextElement variant="title" weight="700" style={styles.statNumber}>
            {dayStreak}
          </TextElement>
          <TextElement variant="caption" style={styles.statLabel}>
            Day Streak
          </TextElement>
        </View>
      </Row>

      {/* Achievements Row */}
      {/* <Row justify="space-around" style={styles.achievementsRow}>
        {achievements.map((ach, idx) => (
          <View key={idx} style={styles.achievementBox}>
            <View style={styles.iconWrapper}>
              <Icon name={ach.icon} size={20} color={colors.primary} />
            </View>
            <TextElement variant="caption" weight="500" style={styles.achLabel}>
              {ach.label}
            </TextElement>
          </View>
        ))}
      </Row> */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: ms(22),
    paddingVertical: vs(12),
    paddingHorizontal: spacing.md,
    // marginHorizontal: spacing.md,
    marginVertical: vs(10),
    // shadow
  },
  // header: {
  //   marginHorizontal: spacing.md,
  //   marginBottom: spacing.md,
  //   fontSize: ms(18),
  //   color: colors.text,
  // },
  statsRow: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    // backgroundColor: 'red',
    flex: 1,
  },
  statNumber: {
    color: colors.primary,
    marginBottom: vs(6),
    fontSize: ms(22),
  },
  statLabel: {
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: ms(10),
  },
  divider: {
    width: 1,
    height: vs(34),
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  // achievementsRow: {},
  // achievementBox: {
  //   alignItems: 'center',
  //   flex: 1,
  //   backgroundColor: colors.surface,
  //   borderRadius: spacing.sm,
  //   paddingVertical: spacing.sm,
  //   marginHorizontal: spacing.xs,
  // },
  // iconWrapper: {
  //   width: spacing.md * 4,
  //   height: spacing.md * 4,
  //   borderRadius: (spacing.md * 4) / 2,
  //   backgroundColor: colors.background,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginBottom: spacing.xs,
  // },
  // achLabel: {
  //   textAlign: 'center',
  //   fontSize: typography.small,
  //   color: colors.text,
  // },
});
