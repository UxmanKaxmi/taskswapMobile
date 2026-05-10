import React from 'react';

import { ProgressUpdate, TaskType } from '@features/Tasks/types/tasks';
import AdviceDetail from './AdviceDetail';
import DecisionDetail from './DecisionDetail';
import MotivationDetail from './MotivationDetail';
import ReminderDetail from './ReminderDetail';

type Props = {
  task: {
    type: TaskType;
    text: string;
    id: string;
    name: string;
    userId: string;
    avatar?: string;
    progressUpdates?: ProgressUpdate[];
  };
};

export default function TaskDetailBody({ task }: Props) {
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
