import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import Avatar from '@shared/components/Avatar/Avatar';
import Tag from '@shared/components/Tag/Tag';
import PushButton from '@shared/components/PushButton';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { getFeelingLabel } from '@shared/utils/feelings';
import { timeAgo } from '@shared/utils/helperFunctions';
import { getCircleDayNumber } from '../utils/circleDay';
import type { CircleLane } from '../types/circles.types';

// Mirrors the server's circle progress-update cooldown (24h prod, 1min dev).
const UPDATE_COOLDOWN_MS = __DEV__ ? 60 * 1000 : 24 * 60 * 60 * 1000;

type Props = {
  lane: CircleLane;
  isViewerLane: boolean;
  onPressLane: (lane: CircleLane) => void;
  onPressPush: (lane: CircleLane) => void;
  onPressNudge: (lane: CircleLane) => void;
  onPressReact: (lane: CircleLane) => void;
  onPressShareUpdate: () => void;
  isPushing: boolean;
};

// One lane per member (prototype v3): your lane carries a yellow border and
// a YOU tag; updates are green blocks with a timestamp and a cheer chip;
// Nudge and Push sit together in the lane footer. Positive events only.
export default function CircleLaneCard({
  lane,
  isViewerLane,
  onPressLane,
  onPressPush,
  onPressNudge,
  onPressReact,
  onPressShareUpdate,
  isPushing,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const feelingLabel = lane.feeling ? getFeelingLabel(lane.feeling) : null;
  const isDone = lane.state === 'done' || lane.completed;
  const canPush = !isViewerLane && !isDone && !!lane.taskId;
  const canReact = !isViewerLane && Boolean(lane.latestUpdate?.beatId) && !isDone;
  // One update a day (mirrors the server cooldown on circle progress updates).
  const lastUpdateAtMs = lane.latestUpdate ? Date.parse(lane.latestUpdate.createdAt) : 0;
  const updateCoolingDown =
    isViewerLane && lastUpdateAtMs > 0 && Date.now() - lastUpdateAtMs < UPDATE_COOLDOWN_MS;
  const cheerCount = lane.latestUpdate?.cheerCount ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isViewerLane && styles.cardYou,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPressLane(lane)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${lane.name}'s goal`}
    >
      <View style={styles.topRow}>
        <Avatar uri={lane.avatar || undefined} fallback={lane.name?.[0] ?? '?'} size={40} />

        <View style={styles.who}>
          <View style={styles.nameRow}>
            <TextElement variant="subtitle" weight="700" style={styles.name} numberOfLines={1}>
              {lane.name}
            </TextElement>
            {isViewerLane ? (
              <View style={styles.youTag}>
                <TextElement variant="caption" weight="800" style={styles.youTagText}>
                  YOU
                </TextElement>
              </View>
            ) : feelingLabel && !isDone ? (
              <Tag
                label={feelingLabel}
                selectOnly
                selected={false}
                onPress={() => {}}
                fillColor={colors.onboardingPaper}
                borderColor={colors.onboardingLine}
                labelColor="muted"
                style={styles.moodTag}
              />
            ) : null}
          </View>
          <TextElement variant="caption" color="muted" style={styles.day}>
            {isDone ? 'Took the win ✓' : `Day ${getCircleDayNumber(lane.taskCreatedAt)}`}
          </TextElement>
        </View>

        {isDone ? (
          <View style={styles.doneBadge}>
            <TextElement variant="caption" weight="800" style={styles.doneBadgeText}>
              DONE ✓
            </TextElement>
          </View>
        ) : null}
      </View>

      {lane.latestUpdate ? (
        <View style={styles.updateBox}>
          <View style={styles.updateLabelRow}>
            <TextElement variant="caption" weight="800" style={styles.updateLabel}>
              {isViewerLane ? 'YOUR UPDATE' : 'UPDATE'}
            </TextElement>
            <TextElement variant="caption" style={styles.updateWhen}>
              {timeAgo(lane.latestUpdate.createdAt)}
            </TextElement>
          </View>
          <TextElement variant="bodySmall" weight="600" style={styles.updateText}>
            {lane.latestUpdate.text}
          </TextElement>

          {canReact || cheerCount > 0 ? (
            <View style={styles.reactsRow}>
              <Pressable
                style={[styles.reactChip, lane.latestUpdate.viewerHasCheered && styles.reactChipOn]}
                disabled={!canReact || lane.latestUpdate.viewerHasCheered}
                onPress={event => {
                  event.stopPropagation?.();
                  onPressReact(lane);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Cheer ${lane.name}'s update`}
              >
                <TextElement
                  variant="caption"
                  weight="700"
                  style={[
                    styles.reactChipText,
                    lane.latestUpdate.viewerHasCheered && styles.reactChipTextOn,
                  ]}
                >
                  ⚡ {cheerCount > 0 ? cheerCount : 'Cheer'}
                </TextElement>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : !isViewerLane && !isDone ? (
        <TextElement variant="caption" color="muted" style={styles.noUpdate}>
          No update yet. A push might land at the right moment.
        </TextElement>
      ) : null}

      {isViewerLane && !isDone ? (
        <Pressable
          style={[styles.shareUpdateButton, updateCoolingDown && styles.shareUpdateButtonDisabled]}
          disabled={updateCoolingDown}
          onPress={event => {
            event.stopPropagation?.();
            onPressShareUpdate();
          }}
          accessibilityRole="button"
          accessibilityState={{ disabled: updateCoolingDown }}
          accessibilityLabel={
            updateCoolingDown
              ? 'Update shared. One update a day'
              : 'Share an update with your circle'
          }
        >
          <TextElement
            variant="bodySmall"
            weight="700"
            style={updateCoolingDown ? styles.shareUpdateTextDisabled : styles.shareUpdateText}
          >
            {updateCoolingDown ? 'Shared ✓ · one update a day' : '✎ Share an update'}
          </TextElement>
        </Pressable>
      ) : null}

      <View style={styles.footerRow}>
        <TextElement variant="caption" color="muted">
          <TextElement variant="caption" weight="700" style={styles.footerCount}>
            {lane.pushCount}
          </TextElement>{' '}
          {lane.pushCount === 1 ? 'push' : 'pushes'}
          {cheerCount > 0 ? ` · ${cheerCount} ${cheerCount === 1 ? 'cheer' : 'cheers'}` : ''}
        </TextElement>

        {!isViewerLane && !isDone ? (
          <View style={styles.laneActions}>
            <Pressable
              style={[styles.nudgeButton, lane.viewerHasNudged && styles.nudgeButtonDone]}
              disabled={lane.viewerHasNudged}
              onPress={event => {
                event.stopPropagation?.();
                onPressNudge(lane);
              }}
              accessibilityRole="button"
              accessibilityLabel={
                lane.viewerHasNudged
                  ? `You already nudged ${lane.name} today`
                  : `Nudge ${lane.name}`
              }
            >
              <TextElement
                variant="caption"
                weight="700"
                style={[styles.nudgeText, lane.viewerHasNudged && styles.nudgeTextDone]}
              >
                {lane.viewerHasNudged ? 'Nudged ✓' : '👋 Nudge'}
              </TextElement>
            </Pressable>

            {canPush ? (
              <PushButton
                onPress={() => onPressPush(lane)}
                variant="push"
                size="sm"
                label="Push"
                activeLabel="Pushed"
                active={lane.hasPushed}
                loading={isPushing}
                textStyle={styles.pushText}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: 'transparent',
      paddingVertical: vs(14),
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    cardYou: {
      borderColor: colors.onboardingPush,
    },
    cardPressed: {
      opacity: 0.92,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
    },
    who: {
      flex: 1,
      minWidth: 0,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(6),
    },
    name: {
      fontSize: ms(14),
      color: colors.text,
      flexShrink: 1,
    },
    youTag: {
      backgroundColor: colors.reminderBg,
      borderRadius: 999,
      paddingVertical: vs(1.5),
      paddingHorizontal: ms(8),
    },
    youTagText: {
      fontSize: ms(9),
      letterSpacing: 0.8,
      color: colors.onboardingInk,
    },
    moodTag: {
      borderRadius: 999,
      paddingVertical: vs(1.5),
      paddingHorizontal: ms(9),
    },
    day: {
      marginTop: vs(1),
      fontSize: ms(11.5),
    },
    doneBadge: {
      backgroundColor: colors.onboardingCard,
      borderRadius: 999,
      paddingVertical: vs(5),
      paddingHorizontal: ms(10),
    },
    doneBadgeText: {
      fontSize: ms(10),
      letterSpacing: 0.8,
      color: colors.onboardingPush,
    },
    updateBox: {
      marginTop: vs(9),
      borderLeftWidth: 3,
      borderLeftColor: colors.onboardingDone,
      backgroundColor: colors.onboardingDoneSoft,
      borderRadius: 10,
      paddingVertical: vs(8),
      paddingHorizontal: ms(11),
    },
    updateLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: vs(2),
    },
    updateLabel: {
      fontSize: ms(9.5),
      letterSpacing: 1,
      color: colors.onboardingDone,
    },
    updateWhen: {
      fontSize: ms(10.5),
      color: colors.muted,
    },
    updateText: {
      fontSize: ms(13),
      lineHeight: ms(18),
      color: colors.text,
    },
    reactsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(6),
      marginTop: vs(8),
    },
    // The app's gray tag treatment (same as mood pills), with the ⚡ icon.
    reactChip: {
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      backgroundColor: colors.onboardingPaper,
      borderRadius: 999,
      paddingVertical: vs(4),
      paddingHorizontal: ms(12),
    },
    reactChipOn: {
      borderColor: colors.onboardingPush,
      backgroundColor: colors.reminderBg,
    },
    reactChipText: {
      fontSize: ms(12),
      color: colors.muted,
    },
    reactChipTextOn: {
      color: colors.onboardingInk,
    },
    noUpdate: {
      marginTop: vs(9),
      fontSize: ms(12),
      lineHeight: ms(16),
    },
    shareUpdateButton: {
      marginTop: vs(9),
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.onboardingLine,
      borderRadius: 999,
      paddingVertical: vs(7),
      alignItems: 'center',
    },
    shareUpdateButtonDisabled: {
      borderStyle: 'solid',
      borderColor: 'transparent',
      backgroundColor: colors.onboardingPaper,
    },
    shareUpdateText: {
      color: colors.onboardingInk,
      fontSize: ms(12.5),
    },
    shareUpdateTextDisabled: {
      color: colors.muted,
      fontSize: ms(12.5),
    },
    footerRow: {
      marginTop: vs(9),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerCount: {
      color: colors.text,
    },
    laneActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
    },
    nudgeButton: {
      borderWidth: 1.5,
      borderColor: colors.onboardingLine,
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingVertical: vs(7),
      paddingHorizontal: ms(12),
    },
    nudgeButtonDone: {
      borderColor: 'transparent',
      backgroundColor: colors.onboardingPaper,
    },
    nudgeText: {
      fontSize: ms(12),
      color: colors.text,
    },
    nudgeTextDone: {
      color: colors.muted,
    },
    pushText: {
      fontSize: ms(12.5),
    },
  });
