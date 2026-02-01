// src/features/tasks/components/TaskDetailBody.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { TaskType } from '@features/Tasks/types/tasks';
import { stripOuterQuotes } from '@shared/utils/helperFunctions';
import MotivationDetail from './MotivationDetail';
import AdviceDetail from './AdviceDetail';
import DecisionDetail from './DecisionDetail';
import ReminderDetail from './ReminderDetail';

type Props = {
  task: {
    type: TaskType;
    text: string;
    id: string;
    name: string;
    userId: string;
  };
};

export default function TaskDetailBody({ task }: Props) {
  console.log('task.type', task.type);
  switch (task.type) {
    case 'motivation':
      return <MotivationDetail task={task} />;

    case 'advice':
      return <AdviceDetail task={task} />;

    case 'decision':
      return <DecisionDetail task={task} />;

    case 'reminder':
      return <ReminderDetail task={task} />;

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  //   container: {
  //     // backgroundColor: colors.surface ?? '#fff',
  //     // borderRadius: 16,
  //     // padding: spacing.md,
  //     paddingVertical: spacing.md,
  //   },
  //   mainText: {
  //     // marginBottom: vs(8),
  //     fontSize: ms(26),
  //     lineHeight: ms(32),
  //     fontWeight: '600',
  //   },
});
