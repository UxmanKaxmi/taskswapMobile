import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import Icon from '@shared/components/Icons/Icon';
import Row from '@shared/components/Layout/Row';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import TextElement from '@shared/components/TextElement/TextElement';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { colors, spacing } from '@shared/theme';
import { getFirstName, stripOuterQuotes, timeAgo } from '@shared/utils/helperFunctions';
import type { ProgressUpdate } from '@features/Tasks/types/tasks';

type Props = {
  task: {
    id: string;
    name: string;
    userId: string;
    avatar?: string;
    completed?: boolean;
    progressUpdates?: ProgressUpdate[];
  };
  isOwner: boolean;
  hasPushed?: boolean;
  userPushedAt?: string | null;
};

export default function TaskDetailProgress({
  task,
  isOwner,
  hasPushed = false,
  userPushedAt,
}: Props) {
  const latestUpdate = getLatestProgressUpdate(task.progressUpdates);

  if (!latestUpdate) {
    return null;
  }

  const hasPushedBeforeUpdate =
    !isOwner && hasPushed && didPushHappenBeforeUpdate(userPushedAt, latestUpdate.createdAt);
  const footerCopy = getProgressFooterCopy({
    isOwner,
    isCompleted: !!task.completed,
    hasPushedBeforeUpdate,
  });

  return (
    <View style={styles.wrapper}>
      <SectionHeader label="Progress" icon="trending-up-outline" />

      <Shadow size="tint" style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <TextElement variant="subtitle" style={styles.title}>
              {getFirstName(task.name)} shared an update
            </TextElement>

            <TextElement variant="bodySmall" color="muted" style={styles.body}>
              {stripOuterQuotes(latestUpdate.text)}
            </TextElement>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <TextElement variant="caption" color="muted" style={styles.time}>
            {timeAgo(latestUpdate.createdAt)}
          </TextElement>

          {footerCopy && (
            <Row align="center" gap={4} style={styles.footerStatus}>
              <Icon
                set="fa6"
                name="hand-holding-heart"
                iconStyle="solid"
                size={12}
                color={colors.motivationBgHardest}
              />
              <TextElement variant="caption" style={styles.helpedText}>
                {footerCopy}
              </TextElement>
            </Row>
          )}
        </View>
      </Shadow>
    </View>
  );
}

function getLatestProgressUpdate(updates?: ProgressUpdate[]): ProgressUpdate | null {
  return updates?.[0] ?? null;
}

function didPushHappenBeforeUpdate(pushedAt?: string | null, updateCreatedAt?: string) {
  if (!pushedAt || !updateCreatedAt) return false;

  const pushedAtTime = new Date(pushedAt).getTime();
  const updateCreatedAtTime = new Date(updateCreatedAt).getTime();

  if (!Number.isFinite(pushedAtTime) || !Number.isFinite(updateCreatedAtTime)) return false;

  return pushedAtTime < updateCreatedAtTime;
}

function getProgressFooterCopy({
  isOwner,
  isCompleted,
  hasPushedBeforeUpdate,
}: {
  isOwner: boolean;
  isCompleted: boolean;
  hasPushedBeforeUpdate: boolean;
}) {
  if (isOwner) return 'Your supporters are with you.';
  if (!hasPushedBeforeUpdate) return null;
  return isCompleted ? 'Your push helped.' : 'Your push is making a difference.';
}

const styles = StyleSheet.create({
  wrapper: {},

  card: {
    backgroundColor: colors.onPrimary,
    borderRadius: 28,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  headerText: {
    flex: 1,
    paddingTop: vs(2),
  },

  title: {
    fontSize: ms(16),
    lineHeight: ms(22),
    fontWeight: '500',
    color: colors.text,
  },

  body: {
    marginTop: vs(6),
    fontSize: ms(12),
    lineHeight: ms(20),
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  time: {
    fontSize: ms(10),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  footerStatus: {
    flexShrink: 1,
    justifyContent: 'flex-end',
  },

  helpedText: {
    fontSize: ms(10),
    fontWeight: '700',
    color: colors.motivationBgHardest,
    marginLeft: spacing.xs,
  },
});
