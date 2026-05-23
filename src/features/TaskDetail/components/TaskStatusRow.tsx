import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { colors, spacing } from '@shared/theme';
import { formatViewCount } from '@shared/utils/helperFunctions';
import { TaskType } from '@features/Tasks/types/tasks';
import ButtonBase from '@shared/components/Buttons/ButtonBase';

type Props = {
  completed: boolean;
  viewsCount?: number;
  onMarkComplete?: () => void;
  isOwner?: boolean;
  containerStyle?: object;
  taskType?: TaskType;
};

export default function TaskStatusRow({
  completed,
  viewsCount = 0,
  onMarkComplete,
  isOwner,
  containerStyle,
  taskType,
}: Props) {
  const ctaColor = getCtaColor(taskType);
  const ctaLabel = taskType === 'decision' ? "I've decided" : 'Mark complete';

  return (
    <View style={[styles.container, containerStyle]}>
      {/* LEFT */}
      <View style={styles.left}>
        {/* <View style={styles.dot} /> */}

        <View style={styles.views}>
          <Icon set="ion" name="eye-sharp" size={14} color={colors.placeHolder} />
          <TextElement style={styles.viewsText}>{formatViewCount(viewsCount)} views</TextElement>
        </View>
      </View>

      {/* RIGHT */}
      {!completed && isOwner && onMarkComplete && (
        <View style={styles.right}>
          <ButtonBase
            title={ctaLabel}
            onPress={onMarkComplete}
            backgroundColor={ctaColor}
            textColor={colors.onPrimary}
            icon={<Icon set="ion" name="checkmark-circle" size={16} color={colors.onPrimary} />}
            style={styles.completeButton}
            textStyle={styles.completeButtonText}
          />
        </View>
      )}
    </View>
  );
}

function getCtaColor(taskType?: TaskType) {
  switch (taskType) {
    case 'decision':
      return colors.decisionBgHardest;
    case 'reminder':
      return colors.reminderBgHardest;
    case 'motivation':
      return colors.motivationBgHardest;
    case 'advice':
      return colors.adviceBgHardest;
    default:
      return colors.primary;
  }
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },

  /* LEFT */

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  views: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  viewsText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.placeHolder,
  },

  /* RIGHT */

  right: {
    alignItems: 'flex-end',
  },

  completeButton: {
    alignSelf: 'flex-end',
    marginVertical: 0,
    marginHorizontal: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 0,
  },

  completeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
