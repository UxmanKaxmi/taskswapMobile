// src/features/tasks/components/body/MotivationDetail.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth, useIsOwner } from '@features/Auth/AuthProvider';
import { useTaskPushes } from '@features/Tasks/hooks/useTaskPush';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import PushSupportCard from './PushSupportCard';
import TaskProgressUpdateHistory from './TaskProgressUpdateHistory';
import type { AvatarUser, ProgressUpdate, TaskBeat } from '@features/Tasks/types/tasks';
import { Height } from '@shared/components/Spacing';
import { vs } from 'react-native-size-matters';
import { colors } from '@shared/theme';
import CompletedSupportCard from './CompletedSupportCard';

// 🚧 TEMP TEST SCAFFOLDING — flip to true to preview many progress updates. Remove when done.
const DEV_MOCK_MANY_UPDATES = false;
const DEV_MOCK_COUNT = 40;

function buildMockBeats(count: number): TaskBeat[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(now - i * 6 * 60 * 60 * 1000).toISOString(); // 6h apart
    const cheerCount = (count - i) % 7;
    return {
      beatId: `mock-beat-${i}`,
      id: `mock-beat-${i}`,
      updateId: `mock-update-${i}`,
      type: 'update',
      text: `Mock progress update #${count - i}. This is sample text to preview the timeline layout.`,
      createdAt,
      isLatest: i === 0,
      isCheeringOpen: i === 0,
      cheerCount,
      sampleCheerers: [],
      callerHasCheered: false,
      isMostCheered: i === 1,
    } as TaskBeat;
  });
}

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
    text: string;
    name: string;
    userId: string;
    avatar?: string;
    createdAt?: string;
    completed?: boolean;
    completedAt?: string | null;
    progressUpdates?: ProgressUpdate[];
    beats?: TaskBeat[];
    cheerTotal?: number;
    distinctCheererCount?: number;
    sampleCheerers?: AvatarUser[];
    pushHistory?: PushEvent[];
    pushCount?: number;
    hasPushed?: boolean;
  };
  progressSectionRef?: React.RefObject<any>;
  highlightProgressSection?: boolean;
  highlightProgressUpdateId?: string;
  highlightBeatId?: string;
  canViewerCheer?: boolean;
  onCheerPress?: (beat: TaskBeat) => void;
  onShareUpdate?: (beat: TaskBeat) => void;
  isSendingCheer?: boolean;
};

export default function MotivationDetail({
  task,
  progressSectionRef,
  highlightProgressSection = false,
  highlightProgressUpdateId,
  highlightBeatId,
  canViewerCheer,
  onCheerPress,
  onShareUpdate,
  isSendingCheer,
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

  const hasPushed = pushData?.hasPushed ?? task.hasPushed ?? false;
  // Authoritative count: live push query when signed in, otherwise the task's
  // own count (the pusher list may be unavailable, e.g. for signed-out viewers).
  const pushCount = pushData?.pushCount ?? task.pushCount ?? 0;
  const hasProgressUpdates = (task.progressUpdates?.length ?? 0) > 0;
  const hasBeatData = (task.beats?.length ?? 0) > 0;
  const latestBeat = React.useMemo(() => getLatestCheerableBeat(task.beats), [task.beats]);
  const latestBeatCheerCount = latestBeat?.cheerCount ?? 0;
  const latestBeatDistinctCheererCount = React.useMemo(() => {
    if (!latestBeat || latestBeatCheerCount <= 0) return 0;

    if (typeof latestBeat.distinctCheererCount === 'number') {
      return Math.min(latestBeat.distinctCheererCount, latestBeatCheerCount);
    }

    if ((task.beats?.length ?? 0) === 1 && typeof task.distinctCheererCount === 'number') {
      return Math.min(task.distinctCheererCount, latestBeatCheerCount);
    }

    const sampleCount = latestBeat.sampleCheerers?.length ?? 0;
    return sampleCount > 0 ? Math.min(sampleCount, latestBeatCheerCount) : latestBeatCheerCount;
  }, [latestBeat, latestBeatCheerCount, task.beats?.length, task.distinctCheererCount]);

  // Aggregate cheers across ALL beats (the task post + every update), not just
  // the latest one — otherwise a cheer on an earlier beat disappears from the
  // support card as soon as a newer beat exists. The server already totals
  // these across beats; fall back to summing beats if the totals are absent.
  const totalCheerCount = React.useMemo(() => {
    if (typeof task.cheerTotal === 'number') return task.cheerTotal;
    return (task.beats ?? []).reduce((sum, beat) => sum + (beat.cheerCount ?? 0), 0);
  }, [task.cheerTotal, task.beats]);

  const totalDistinctCheererCount = React.useMemo(() => {
    if (totalCheerCount <= 0) return 0;
    if (typeof task.distinctCheererCount === 'number') {
      return Math.min(task.distinctCheererCount, totalCheerCount);
    }
    return Math.min(latestBeatDistinctCheererCount || totalCheerCount, totalCheerCount);
  }, [task.distinctCheererCount, totalCheerCount, latestBeatDistinctCheererCount]);

  const viewerHasCheeredAny = React.useMemo(
    () => (task.beats ?? []).some(beat => Boolean(beat.callerHasCheered)),
    [task.beats],
  );

  // Show the section when there are updates, or prompt the owner to add one
  // (only while the task is still active).
  const showProgressSection = hasProgressUpdates || hasBeatData || (isOwner && !isCompleted);
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
          <SectionHeader
            label={'Support'}
            iconSet="fa6"
            icon="bolt"
            iconColor={colors.onboardingInk}
            labelColor={colors.onboardingInk}
          />
          {/* <View style={styles.card}> */}

          {/* FOOTER */}

          {/* PUSH ACTIVITY */}
          {/* <PushActivityList data={mockPushes} /> */}
          <PushSupportCard
            pushes={normalizedPushes}
            isOwner={isOwner}
            currentUserId={currentUserId}
            didUserPush={hasPushed}
            pushCount={pushCount}
            emptyStateTitle="No pushes yet"
            emptyStateDescription={
              isOwner ? (
                <>Share this request with someone you trust.</>
              ) : (
                <>Be the first to support {task.name}.</>
              )
            }
            cheerSummary={
              totalCheerCount > 0
                ? {
                    ownerName: task.name,
                    // 'post' → the summary copy reads "…{owner}'s task", which
                    // reads correctly as an umbrella over all beats.
                    beatType: 'post',
                    cheerCount: totalCheerCount,
                    distinctCheererCount: totalDistinctCheererCount,
                    viewerHasCheered: viewerHasCheeredAny,
                  }
                : undefined
            }
          />
          {/* </View> */}
        </>
      )}

      {/* {showProgressSection && ( */}
      <View ref={progressSectionRef} style={styles.section}>
        <Height size={vs(20)} />
        <SectionHeader label={'Progress'} icon="trending-up" />

        <TaskProgressUpdateHistory
          updates={task.progressUpdates}
          beats={__DEV__ && DEV_MOCK_MANY_UPDATES ? buildMockBeats(DEV_MOCK_COUNT) : task.beats}
          taskText={task.text}
          ownerName={task.name}
          ownerAvatar={task.avatar}
          isOwner={isOwner}
          highlightUpdateId={highlightProgressUpdateId}
          highlightBeatId={highlightBeatId}
          canViewerCheer={canViewerCheer}
          onCheerPress={onCheerPress}
          onShareUpdate={onShareUpdate}
          isSendingCheer={isSendingCheer}
        />
      </View>
      {/* )} */}
      {/* <TaskDetailProgress task={task} isOwner={isOwner} hasPushed={hasPushed} /> */}
    </>
  );
}

function getLatestCheerableBeat(beats?: TaskBeat[]): TaskBeat | null {
  if (!beats?.length) return null;

  return (
    beats.find(beat => beat?.isLatest) ??
    [...beats].filter(Boolean).sort((a, b) => {
      const bTime = new Date(b.createdAt).getTime();
      const aTime = new Date(a.createdAt).getTime();
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    })[0] ??
    null
  );
}

const styles = StyleSheet.create({
  section: {
    // borderRadius: 24,
    // backgroundColor: 'rgba(255, 210, 63, 0.18)',
    // paddingHorizontal: 10,
    // paddingVertical: 8,
    // marginHorizontal: -10,
  },
});
