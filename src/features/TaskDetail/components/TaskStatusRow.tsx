import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { colors, spacing } from '@shared/theme';
import { formatViewCount } from '@shared/utils/helperFunctions';
import { TaskType } from '@features/Tasks/types/tasks';
import { showConfirmAlert } from '@shared/utils/confirmAlert';

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
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.right}
          onPress={() => {
            showConfirmAlert({
              title: taskType === 'decision' ? 'Finalize your decision?' : 'Mark task as complete?',
              message:
                taskType === 'decision'
                  ? 'This will lock voting and finalize the result.'
                  : 'This action can’t be undone.',
              confirmText: taskType === 'decision' ? "I've decided" : 'Mark complete',
              onConfirm: () => {
                onMarkComplete?.();
              },
            });
          }}
        >
          <TextElement style={styles.completeText}>
            {taskType === 'decision' ? "I've decided" : 'Mark complete'}
          </TextElement>
          <Icon set="ion" name="checkmark-circle-outline" size={14} color={colors.placeHolder} />
        </TouchableOpacity>
      )}
    </View>
  );
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

  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
    marginHorizontal: spacing.sm,
    opacity: 0.5,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  completeText: {
    fontSize: 14,
    color: colors.placeHolder,
    fontWeight: '500',
  },

  activePill: {
    backgroundColor: colors.onAccent,
  },

  completedPill: {
    backgroundColor: colors.onAccent,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },

  completedText: {
    color: colors.placeHolder,
  },
});
