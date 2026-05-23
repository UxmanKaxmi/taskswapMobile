import React, { type RefObject } from 'react';

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
    completed?: boolean;
    createdAt?: string;
    completedAt?: string | null;
    pushHistory?: Array<{
      createdAt?: string;
      pushedAt?: string;
      user?: {
        id: string;
        name: string;
        photo?: string;
      };
    }>;
    progressUpdates?: ProgressUpdate[];
  };
  progressSectionRef?: RefObject<any>;
  adviceSectionRef?: RefObject<any>;
  highlightProgressSection?: boolean;
  highlightProgressUpdateId?: string;
  highlightCommentId?: string;
};

export default function TaskDetailBody({
  task,
  progressSectionRef,
  adviceSectionRef,
  highlightProgressSection,
  highlightProgressUpdateId,
  highlightCommentId,
}: Props) {
  switch (task.type) {
    case 'motivation':
      return (
        <MotivationDetail
          task={task}
          progressSectionRef={progressSectionRef}
          highlightProgressSection={highlightProgressSection}
          highlightProgressUpdateId={highlightProgressUpdateId}
        />
      );

    case 'advice':
      return (
        <AdviceDetail
          task={task}
          adviceSectionRef={adviceSectionRef}
          highlightCommentId={highlightCommentId}
        />
      );

    case 'decision':
      return <DecisionDetail task={task} />;

    case 'reminder':
      return <ReminderDetail task={task} />;

    default:
      return null;
  }
}
