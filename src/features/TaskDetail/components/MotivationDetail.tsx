// src/features/tasks/components/body/MotivationDetail.tsx

import React from 'react';
import { useAuth, useIsOwner } from '@features/Auth/AuthProvider';
import { useTaskPushes } from '@features/Tasks/hooks/useTaskPush';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import PushSupportCard from './PushSupportCard';
import TaskProgressUpdateHistory from './TaskProgressUpdateHistory';
import type { ProgressUpdate } from '@features/Tasks/types/tasks';
import { Height } from '@shared/components/Spacing';
import { vs } from 'react-native-size-matters';
import TaskDetailProgress from './TaskDetailProgress';

type PushEvent = {
  createdAt?: string;
  pushedAt?: string;
  user: {
    id: string;
    name: string;
    photo: string;
  };
};

type Props = {
  task: {
    id: string;
    name: string;
    userId: string;
    avatar?: string;
    completed?: boolean;
    progressUpdates?: ProgressUpdate[];
    pushHistory?: PushEvent[];
  };
};

export default function MotivationDetail({ task }: Props) {
  const isOwner = useIsOwner(task.userId);

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

  return (
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

      <Height size={vs(20)} />
      <SectionHeader label={'Progress'} icon="trending-up-outline" />

      <TaskProgressUpdateHistory
        updates={task.progressUpdates}
        ownerName={task.name}
        ownerAvatar={task.avatar}
        isOwner={isOwner}
      />
      {/* <TaskDetailProgress task={task} isOwner={isOwner} hasPushed={hasPushed} /> */}
    </>
  );
}
