import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import Row from '@shared/components/Layout/Row';
import Column from '@shared/components/Layout/Column';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import TaskMetaRow from '@features/Home/components/TaskMetaRow';
import HelperAvatarGroup from '@features/Home/components/HelperAvatarGroup';

import { colors, spacing } from '@shared/theme';
import { timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { getTypeVisual, typeIcons } from '@shared/utils/typeVisuals';
import { TaskType } from '@features/Tasks/types/tasks';
import { HelperUser } from '@features/Home/types/home';
import { Icon } from '@shared/components/Icons';
import { Shadow } from '@shared/components/Shadow';

type Props = {
  task: {
    type: TaskType;
    avatar: string;
    name: string;
    createdAt: string;
    text: string;
    helpers?: HelperUser[];
    completed?: boolean;
  };
};

export function TaskDetailHeader({ task }: Props) {
  const { emoji } = getTypeVisual(task.type);
  const avatarSize = ms(45);

  const iconName = typeIcons[task.type];

  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case 'advice':
        return colors.adviceBgHardest;
      case 'reminder':
        return colors.reminderBgHardest;
      case 'motivation':
        return colors.motivationBgHardest;
      case 'decision':
        return colors.decisionBgHardest;
      default:
        return colors.muted;
    }
  };

  return (
    <Row align="center" justify="flex-start">
      {/* Avatar + helpers */}
      <View style={[styles.avatarWrapper, { width: avatarSize, height: avatarSize }]}>
        <Image
          source={{ uri: task.avatar }}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />

        {!!task.helpers?.length && (
          <HelperAvatarGroup
            helpers={task.helpers}
            avatarSize={ms(18)}
            containerStyle={styles.helperOverlay}
          />
        )}
      </View>

      {/* Name + meta */}
      <View style={{ flex: 1 }}>
        <TextElement variant="subtitle" style={styles.name}>
          {toShortName(task.name)}
        </TextElement>

        {/* 🔥 Meta row (inline) */}
        <Row gap={2} justify="flex-start" align="center" style={styles.metaRow}>
          <Icon
            set="fa6"
            name={iconName}
            size={ms(10)}
            color={getTypeColor(task.type)}
            iconStyle="solid"
            style={styles.metaIcon}
          />

          <TextElement style={[styles.metaText, { color: getTypeColor(task.type) }]}>
            {task.type}
          </TextElement>

          <TextElement style={styles.dot}>•</TextElement>

          <TextElement style={styles.timeText}>{timeAgo(task.createdAt)}</TextElement>
        </Row>
      </View>
      <View
        style={[
          styles.statusPill,
          // task.completed ? styles.completedPill : styles.activePill,
          {
            backgroundColor: getTypeColor(task.type),
          },
        ]}
      >
        <TextElement
          style={[
            styles.statusText,
            {
              color: colors.onPrimary,
              fontWeight: '600',
            },
          ]}
        >
          {task.completed ? 'Completed' : 'Active'}
        </TextElement>
      </View>
    </Row>
  );
}

const styles = StyleSheet.create({
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },

  activePill: {
    borderWidth: 2,
    // borderColor: colors.motivationBgHard,
    // backgroundColor: colors.onAccent,
  },

  completedPill: {
    borderWidth: 2,
    borderColor: colors.motivationBgHard,

    // backgroundColor: colors.onAccent,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.motivationBgHardest,
  },

  completedText: {
    fontSize: 12,
    fontWeight: '400',

    color: colors.motivationBgHardest,
  },

  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },

  avatar: {
    backgroundColor: colors.muted,
  },

  helperOverlay: {
    position: 'absolute',
    bottom: ms(-4),
    right: ms(-6),
  },

  name: {
    fontSize: ms(16),
    // lineHeight: ms(18),
    fontWeight: '600',
  },

  metaRow: {
    marginLeft: ms(1),
  },

  metaIcon: {
    marginRight: ms(5),
  },

  metaText: {
    fontSize: ms(12),
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  timeText: {
    fontSize: ms(12),
    color: colors.muted,
  },

  dot: {
    fontSize: ms(14),
    marginHorizontal: ms(4),
    color: colors.muted,
  },
});
