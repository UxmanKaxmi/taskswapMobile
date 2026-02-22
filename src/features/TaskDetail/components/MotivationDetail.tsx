// src/features/tasks/components/body/MotivationDetail.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import PushButton from '@shared/components/PushButton';
import { spacing, colors } from '@shared/theme';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import { getFirstName } from '@shared/utils/helperFunctions';
import { useAuth, useIsOwner } from '@features/Auth/AuthProvider';
import { usePushInteraction } from '@features/Home/hooks/usePushInteraction';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import { useTaskPushes, useToggleTaskPush } from '@features/Tasks/hooks/useTaskPush';
import { Shadow } from '@shared/components/Shadow';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import PushActivityList from './PushActivityList';
import PushSupportCard from './PushSupportCard';
import TaskStatusRow from './TaskStatusRow';

type Props = {
  task: {
    id: string;
    name: string;
    userId: string;
  };
};

export default function MotivationDetail({ task }: Props) {
  const isOwner = useIsOwner(task.userId);
  const { emoji } = getTypeVisual(TaskTypeEnum.Motivation);

  const { user } = useAuth();
  const currentUserId = user?.id;
  const taskId = task.id;

  console.log('task', task);

  const pushHistory = task?.Push;

  const { data: pushData } = useTaskPushes(taskId);
  const { mutate: togglePush, isPending } = useToggleTaskPush(taskId);

  const hasPushed = pushData?.hasPushed || false;
  const pushCount = pushData?.pushCount || 0;

  const push = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: togglePush,
    onUnpush: togglePush,
    isPushing: isPending,
  });

  const activityData = (task?.Push ?? [])
    .filter((p: any) => p?.user) // ⛑️ guard
    .map((p: any) => ({
      id: `${p.user.id}-${p.createdAt}`,
      type: 'single' as const,
      user: {
        name: p.user.name,
        avatar: p.user.photo,
      },
      createdAt: p.createdAt,
    }));

  return (
    <>
      <SectionHeader label={'Recent Support'} icon="push" />
      {/* <View style={styles.card}> */}

      {/* FOOTER */}

      {/* PUSH ACTIVITY */}
      {/* <PushActivityList data={mockPushes} /> */}
      <PushSupportCard
        pushes={pushHistory ?? []}
        isOwner={isOwner}
        currentUserId={currentUserId}
        didUserPush={hasPushed}
      />
      {/* </View> */}
    </>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 24,
    marginVertical: spacing.sm,
  },

  card: {
    // backgroundColor: '#EEF9F3',
    backgroundColor: colors.onPrimary,
    borderRadius: 24,
    padding: spacing.lg,
    // gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#8A9AA3',
  },

  helperText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1F2937',
    fontWeight: '600',
  },

  pushButton: {
    alignSelf: 'stretch',
    borderRadius: 999,
  },

  pushedPill: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
  },

  pushedPillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A9AA3',
  },

  footerRow: {
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },

  accentLine: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5BB98C', // 👈 green accent
  },

  footerText: {
    fontSize: 13,
    color: '#8A9AA3',
    opacity: 0.9,
  },
});
