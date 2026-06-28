import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { MotivationTask } from '../types/home';
import { stripOuterQuotes } from '@shared/utils/helperFunctions';
import { Shadow } from '@shared/components/Shadow';
import PushButton from '@shared/components/PushButton';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';

type Props = {
  task?: MotivationTask | null;
  onPressTask?: (task: MotivationTask) => void;
  onPressCreateGoal?: () => void;
};

export default function HomeHeroCard({ task, onPressTask, onPressCreateGoal }: Props) {
  if (!task) {
    return (
      <Shadow size="tint" color="rgba(0, 0, 0, 0.10)" style={styles.shadowWrap}>
        <View style={[styles.card, styles.emptyCard]}>
          <TextElement style={styles.label}>YOUR GOAL</TextElement>
          <TextElement style={styles.title}>Create your first motivation</TextElement>
          <TextElement style={styles.subtitle}>
            Add a goal and let the community push you forward.
          </TextElement>

          <View style={styles.ctaWrap}>
            <PushButton
              onPress={onPressCreateGoal ?? (() => {})}
              label="Add motivation"
              size="md"
              variant="push"
              taskType={TaskTypeEnum.Motivation}
            />
          </View>
        </View>
      </Shadow>
    );
  }

  const dayNumber = getDayNumber(task);
  const pushCount = task.pushCount ?? 0;

  return (
    <Shadow size="tint" color="rgba(0, 0, 0, 0.10)" style={styles.shadowWrap}>
      <Pressable
        onPress={() => onPressTask?.(task)}
        style={({ pressed }) => [styles.card, styles.taskCard, pressed && styles.pressed]}
      >
        <TextElement style={styles.label}>YOUR GOAL · DAY {dayNumber}</TextElement>

        <View style={styles.bodyRow}>
          <View style={styles.textBlock}>
            <TextElement style={styles.title}>{stripOuterQuotes(task.text)}</TextElement>
          </View>

          <View style={styles.pushCountBlock}>
            <TextElement style={styles.pushCountNumber}>{pushCount}</TextElement>
            <TextElement style={styles.pushCountLabel}>pushes</TextElement>
          </View>
        </View>
      </Pressable>
    </Shadow>
  );
}

function getDayNumber(task: MotivationTask) {
  const progressCount = task.progressUpdates?.length ?? 0;

  if (progressCount > 0) {
    return progressCount + 1;
  }

  const parsed = parseISO(task.createdAt);
  if (isValid(parsed)) {
    return Math.max(1, differenceInCalendarDays(new Date(), parsed) + 1);
  }

  return 1;
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 24,
    marginHorizontal: 0,
  },
  card: {
    backgroundColor: colors.onboardingInk,
    borderRadius: 24,
    paddingHorizontal: ms(20),
  },
  taskCard: {
    paddingVertical: vs(14),
  },
  emptyCard: {
    paddingVertical: vs(16),
    minHeight: vs(120),
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  label: {
    color: colors.onboardingPush,
    fontSize: ms(10),
    lineHeight: ms(12),
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: vs(10),
  },
  textBlock: {
    flex: 1,
    paddingRight: 0,
  },
  title: {
    color: colors.onPrimary,
    fontSize: ms(16),
    lineHeight: ms(21),
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.76)',
    marginTop: vs(6),
    fontSize: ms(12),
    lineHeight: ms(16),
  },
  pushCountBlock: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: ms(58),
  },
  pushCountNumber: {
    color: colors.onboardingPush,
    fontSize: ms(24),
    lineHeight: ms(26),
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  pushCountLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: ms(10),
    lineHeight: ms(12),
    marginTop: vs(2),
    fontWeight: '500',
  },
  ctaWrap: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
});
