import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Avatar from '@shared/components/Avatar/Avatar';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import { FriendTask } from '../types/friends';

type Props = {
  task: FriendTask;
  onPress?: () => void;
};

export default function RecentTaskCard({ task, onPress }: Props) {
  const { emoji } = getTypeVisual(task.type);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <TextElement variant="caption" color="muted">
          {timeAgo(task.createdAt)} • {task.type}
        </TextElement>
        <TextElement>{emoji}</TextElement>
      </View>

      <TextElement variant="body" weight="bold" style={styles.text}>
        {task.text}
      </TextElement>

      {task.helpers.length > 0 && (
        <View style={styles.helpers}>
          {task.helpers.map(helper => (
            <Avatar
              key={helper.id}
              uri={helper.photo}
              fallback={helper.name[0]}
              size={28}
              borderColor={colors.border}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  text: {
    marginBottom: spacing.sm,
  },
  helpers: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
