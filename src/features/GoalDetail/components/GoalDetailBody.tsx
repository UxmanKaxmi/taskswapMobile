import React, { type RefObject } from 'react';

import { ProgressUpdate, GoalBeat, GoalType } from '@features/Goals/types/goals';
import MotivationDetail from './MotivationDetail';

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
  highlightProgressSection?: boolean;
  highlightProgressUpdateId?: string;
  highlightBeatId?: string;
  canViewerCheer?: boolean;
  onCheerPress?: (beat: GoalBeat) => void;
  onShareUpdate?: (beat: GoalBeat) => void;
  isSendingCheer?: boolean;
};

export default function GoalDetailBody({
  task,
  progressSectionRef,
  highlightProgressSection,
  highlightProgressUpdateId,
  highlightBeatId,
  canViewerCheer,
  onCheerPress,
  onShareUpdate,
  isSendingCheer,
}: Props) {
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
}
