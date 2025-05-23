// src/features/MyProfile/components/StatsAchievements.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import Icon from '@shared/components/Icons/Icon';
import { spacing, colors, typography } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';

export type StatsAchievementsProps = {
  karmaPoints: number;
  tasksDone: number;
  dayStreak: number;
  achievements?: {
    icon: React.ComponentProps<typeof Icon>['name'];
    label: string;
  }[];
};

export default function StatsAchievements({
  karmaPoints,
  tasksDone,
  dayStreak,
  achievements = [
    { icon: 'trophy', label: 'Super Helper' },
    { icon: 'fire', label: '7 Day Streak' },
    { icon: 'star', label: 'Top Rated' },
  ],
}: StatsAchievementsProps) {
  return (
    <View style={styles.card}>
      {/* <TextElement variant="subtitle" weight="600" style={styles.header}>
        Statistics
      </TextElement> */}

      {/* Stats Row */}
      <Row justify="space-around" style={styles.statsRow}>
        <View style={styles.statItem}>
          <TextElement variant="title" weight="700" style={styles.statNumber}>
            90%
          </TextElement>
          <TextElement variant="caption" color="muted">
            Task Success
          </TextElement>
        </View>
        <View style={styles.statItem}>
          <TextElement variant="title" weight="700" style={styles.statNumber}>
            {tasksDone}
          </TextElement>
          <TextElement variant="caption" color="muted">
            Tasks Done
          </TextElement>
        </View>
        <View style={styles.statItem}>
          <TextElement variant="title" weight="700" style={styles.statNumber}>
            {dayStreak}
          </TextElement>
          <TextElement variant="caption" color="muted">
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
    borderRadius: spacing.sm,
    paddingBottom: 0,
    paddingTop: 10,

    // shadow
  },
  header: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: ms(20),
    color: colors.text,
  },
  statsRow: {},
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: colors.primary,
    marginBottom: vs(5),
  },
  achievementsRow: {},
  achievementBox: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  iconWrapper: {
    width: spacing.md * 4,
    height: spacing.md * 4,
    borderRadius: (spacing.md * 4) / 2,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  achLabel: {
    textAlign: 'center',
    fontSize: typography.small,
    color: colors.text,
  },
});
