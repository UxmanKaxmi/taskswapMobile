// src/shared/components/TaskMetaRow.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { spacing, colors } from '@shared/theme';
import { TaskType } from '@features/Tasks/types/tasks';
import { typeIcons } from '@shared/utils/typeVisuals';
import MotivationOpeningQuote from './MotivationOpeningQuote';

type Props = {
  type: TaskType;
  timeAgo: string;
};

export default function TaskMetaRow({ type, timeAgo }: Props) {
  const iconName = typeIcons[type];

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

  const typeColor = getTypeColor(type);

  return (
    <Row gap={2} style={styles.container}>
      <Icon
        set="fa6"
        name={iconName}
        size={ms(10)}
        color={typeColor}
        iconStyle="solid"
        style={styles.icon}
      />

      <TextElement style={[styles.text, { color: typeColor }]}>{type}</TextElement>

      <TextElement style={styles.dot}>•</TextElement>
      <TextElement style={styles.timeText}>{timeAgo}</TextElement>
    </Row>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: ms(1),
  },

  icon: {
    marginRight: ms(5),
  },

  text: {
    fontSize: ms(12),
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: ms(12),
    // fontWeight: '600',
    color: colors.muted,
  },

  dot: {
    fontSize: ms(12),
    marginHorizontal: ms(4),
    color: colors.muted,
  },
});
