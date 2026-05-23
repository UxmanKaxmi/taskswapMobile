// src/features/tasks/components/body/MotivationDetail.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth, useIsOwner } from '@features/Auth/AuthProvider';
import { useTaskPushes } from '@features/Tasks/hooks/useTaskPush';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import PushSupportCard from './PushSupportCard';
import TaskProgressUpdateHistory from './TaskProgressUpdateHistory';
import type { ProgressUpdate } from '@features/Tasks/types/tasks';
import { Height } from '@shared/components/Spacing';
import { vs } from 'react-native-size-matters';
import CompletedSupportCard from './CompletedSupportCard';

type PushEvent = {
  createdAt?: string;
  pushedAt?: string;
  message?: string | null;
  user?: {
    id: string;
    name: string;
    photo?: string | null;
  };
};

type Props = {
  task: {
    id: string;
    name: string;
    userId: string;
    avatar?: string;
    createdAt?: string;
    completed?: boolean;
    completedAt?: string | null;
    progressUpdates?: ProgressUpdate[];
    pushHistory?: PushEvent[];
  };
  progressSectionRef?: React.RefObject<any>;
  highlightProgressSection?: boolean;
  highlightProgressUpdateId?: string;
};

export default function MotivationDetail({
  task,
  progressSectionRef,
  highlightProgressSection = false,
  highlightProgressUpdateId,
}: Props) {
  const isOwner = useIsOwner(task.userId);
  const isCompleted = Boolean(task.completed || task.completedAt);

  const { user } = useAuth();
  const currentUserId = user?.id;
  const taskId = task.id;

  const pushHistory = task?.pushHistory;
  const normalizedPushes = React.useMemo(
    () =>
      (pushHistory ?? []).map(push => ({
        ...push,
        createdAt: push.createdAt ?? push.pushedAt ?? '',
      })),
    [pushHistory],
  );

  const { data: pushData } = useTaskPushes(taskId);

  const hasPushed = pushData?.hasPushed || false;
  const hasProgressUpdates = (task.progressUpdates?.length ?? 0) > 0;
  return (
    <>
      {isCompleted ? (
        <CompletedSupportCard
          ownerName={task.name}
          isOwner={isOwner}
          createdAt={task.createdAt ?? task.completedAt ?? new Date().toISOString()}
          completedAt={task.completedAt ?? null}
          pushes={normalizedPushes}
          currentUserId={currentUserId}
          didUserPush={hasPushed}
        />
      ) : (
        <>
          <SectionHeader label={'Support'} icon="push" />
          {/* <View style={styles.card}> */}

          {/* FOOTER */}

          {/* PUSH ACTIVITY */}
          {/* <PushActivityList data={mockPushes} /> */}
          <PushSupportCard
            pushes={normalizedPushes}
            isOwner={isOwner}
            currentUserId={currentUserId}
            didUserPush={hasPushed}
            emptyStateTitle="No pushes yet"
            emptyStateDescription={
              isOwner ? (
                <>Share this request with someone you trust.</>
              ) : (
                <>Be the first to support {task.name}.</>
              )
            }
          />
          {/* </View> */}
        </>
      )}

      {hasProgressUpdates && (
        <View
          ref={progressSectionRef}
          style={highlightProgressSection ? styles.highlightedSection : undefined}
        >
          <Height size={vs(20)} />
          <SectionHeader label={'Progress'} icon="trending-up-outline" />

          <TaskProgressUpdateHistory
            updates={task.progressUpdates}
            ownerName={task.name}
            ownerAvatar={task.avatar}
            isOwner={isOwner}
            highlightUpdateId={highlightProgressUpdateId}
          />
        </View>
      )}
      {/* <TaskDetailProgress task={task} isOwner={isOwner} hasPushed={hasPushed} /> */}
    </>
  );
}

const styles = StyleSheet.create({
  highlightedSection: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: -10,
  },
});
