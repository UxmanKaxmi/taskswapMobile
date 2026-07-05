import React, { type RefObject } from 'react';

import { ProgressUpdate, GoalBeat, GoalType } from '@features/Goals/types/goals';
import AdviceDetail from './AdviceDetail';
import DecisionDetail from './DecisionDetail';
import MotivationDetail from './MotivationDetail';
import ReminderDetail from './ReminderDetail';

type Props = {
  task: {
    type: GoalType;
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
    beats?: GoalBeat[];
    cheerTotal?: number;
    distinctCheererCount?: number;
    sampleCheerers?: Array<{
      id: string;
      name?: string;
      photo?: string | null;
      avatar?: string | null;
    }>;
  };
  progressSectionRef?: RefObject<any>;
  adviceSectionRef?: RefObject<any>;
  highlightProgressSection?: boolean;
  highlightProgressUpdateId?: string;
  highlightBeatId?: string;
  highlightCommentId?: string;
  canViewerCheer?: boolean;
  onCheerPress?: (beat: GoalBeat) => void;
  onShareUpdate?: (beat: GoalBeat) => void;
  isSendingCheer?: boolean;
};

export default function GoalDetailBody({
  task,
  progressSectionRef,
  adviceSectionRef,
  highlightProgressSection,
  highlightProgressUpdateId,
  highlightBeatId,
  highlightCommentId,
  canViewerCheer,
  onCheerPress,
  onShareUpdate,
  isSendingCheer,
}: Props) {
  switch (task.type) {
    case 'motivation':
      return (
        <MotivationDetail
          task={task}
          progressSectionRef={progressSectionRef}
          highlightProgressSection={highlightProgressSection}
          highlightProgressUpdateId={highlightProgressUpdateId}
          highlightBeatId={highlightBeatId}
          canViewerCheer={canViewerCheer}
          onCheerPress={onCheerPress}
          onShareUpdate={onShareUpdate}
          isSendingCheer={isSendingCheer}
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
