import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import Ripple from '@shared/components/Buttons/Ripple';
import TextElement from '@shared/components/TextElement/TextElement';
import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { getFirstName, stripOuterQuotes } from '@shared/utils/helperFunctions';
import type { AvatarUser, ProgressUpdate, GoalBeat } from '@features/Goals/types/goals';
import HelperAvatarStack from '@features/Home/components/HelperAvatarStack';
import Icon from '@shared/components/Icons/Icon';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';

type Props = {
  updates?: ProgressUpdate[];
  beats?: GoalBeat[];
  taskText?: string;
  ownerName: string;
  ownerAvatar?: string;
  isOwner?: boolean;
  highlightUpdateId?: string;
  highlightBeatId?: string;
  canViewerCheer?: boolean;
  onCheerPress?: (beat: GoalBeat) => void;
  onShareUpdate?: (beat: GoalBeat) => void;
  isSendingCheer?: boolean;
};

type TimelineBeat = Partial<GoalBeat> & {
  key: string;
  displayText: string;
  displayCreatedAt: string;
  displayLabel: string;
  type: 'post' | 'update';
};

export default function GoalProgressUpdateHistory({
  updates = [],
  beats = [],
  taskText,
  ownerName,
  isOwner,
  highlightUpdateId,
  highlightBeatId,
  canViewerCheer,
  onCheerPress,
  onShareUpdate,
  isSendingCheer,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const rows = useMemo(() => buildRows({ beats, updates, taskText }), [beats, taskText, updates]);
  const firstName = getFirstName(ownerName);
  const actor = isOwner ? 'You' : firstName;

  const highlightIndex = useMemo(
    () =>
      rows.findIndex(
        beat => highlightBeatId === beat.beatId || highlightUpdateId === beat.updateId,
      ),
    [rows, highlightBeatId, highlightUpdateId],
  );

  const [expanded, setExpanded] = useState(false);

  // Auto-expand when a notification targets an update that is collapsed away,
  // so its pulsing dot / scroll-into-view still works.
  useEffect(() => {
    if (highlightIndex >= COLLAPSED_COUNT) setExpanded(true);
  }, [highlightIndex]);

  const hasMore = rows.length > COLLAPSED_COUNT;
  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_COUNT);

  return (
    <Shadow size="tint" style={styles.section}>
      {/* <View style={styles.header}>
        <Icon set="ion" name="trending-up" size={ms(24)} color={colors.onboardingInk} />
        <TextElement style={styles.headerTitle}>Progress</TextElement>
      </View> */}

      {rows.length == 0 ? (
        <View style={styles.emptyWrap}>
          <TextElement style={styles.emptyTitle}>No updates yet</TextElement>
          <TextElement style={styles.emptyBody}>
            {isOwner
              ? 'Share a quick update to keep people in the loop.'
              : `${firstName} hasn’t shared an update yet.`}
          </TextElement>
        </View>
      ) : (
        <View style={styles.card}>
          {visibleRows.map((beat, index) => (
            <React.Fragment key={beat.key}>
              {index > 0 ? (
                <GapSeparator label={getGapLabel(visibleRows[index - 1], beat)} />
              ) : null}
              <ProgressBeatCard
                beat={beat}
                actor={actor}
                isOwner={isOwner}
                isHighlighted={
                  highlightBeatId === beat.beatId || highlightUpdateId === beat.updateId
                }
                canViewerCheer={canViewerCheer}
                onCheerPress={onCheerPress}
                onShareUpdate={onShareUpdate}
                isSendingCheer={isSendingCheer}
              />
            </React.Fragment>
          ))}

          {hasMore ? (
            <Ripple
              radius={20}
              onPress={() => setExpanded(prev => !prev)}
              style={styles.showAllButton}
            >
              <TextElement style={styles.showAllText}>
                {expanded ? 'Show less' : `Show all ${rows.length} updates`}
              </TextElement>
              <Icon
                set="ion"
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={ms(13)}
                color={colors.onboardingPushDeep}
              />
            </Ripple>
          ) : null}
        </View>
      )}
    </Shadow>
  );
}

const COLLAPSED_COUNT = 4;

function ProgressBeatCard({
  beat,
  actor,
  isOwner,
  isHighlighted,
  canViewerCheer,
  onCheerPress,
  onShareUpdate,
  isSendingCheer,
}: {
  beat: TimelineBeat;
  actor: string;
  isOwner?: boolean;
  isHighlighted?: boolean;
  canViewerCheer?: boolean;
  onCheerPress?: (beat: GoalBeat) => void;
  onShareUpdate?: (beat: GoalBeat) => void;
  isSendingCheer?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const cheerCount = beat.cheerCount ?? 0;
  const isCheeringOpen = Boolean(
    beat.isCheeringOpen === true || (beat.isLatest && beat.isCheeringOpen !== false),
  );
  const canCheer = Boolean(
    canViewerCheer && isCheeringOpen && !beat.callerHasCheered && beat.beatId && onCheerPress,
  );
  const isMostCheered = Boolean(beat.isMostCheered && cheerCount > 0);
  const showFooter = Boolean(beat.beatId);
  const rowLabel =
    beat.type === 'post' ? `${actor} posted this task` : `${actor} shared an update.`;
  const text = stripOuterQuotes(beat.displayText);
  const { date, time } = formatTimelineParts(beat.displayCreatedAt);

  return (
    <View style={styles.beatRow}>
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          {isHighlighted ? <PulsingDot /> : null}
          <TextElement style={styles.dateText} numberOfLines={1}>
            {date}
          </TextElement>
          {time ? <TextElement style={styles.dotSep}>•</TextElement> : null}
          {time ? (
            <TextElement
              style={[styles.clockText, isMostCheered && styles.clockTextMost]}
              numberOfLines={1}
            >
              {time}
            </TextElement>
          ) : null}
        </View>
        {isMostCheered ? (
          <View style={styles.mostCheeredPill}>
            <Icon set="ion" name="sparkles" size={ms(9)} color={colors.tactileMomentumSecondary} />
            <TextElement style={styles.mostCheeredText}>MOST CHEERED</TextElement>
          </View>
        ) : null}
      </View>

      <TextElement style={styles.rowLabel}>{rowLabel}</TextElement>
      <TextElement style={styles.beatText}>{text || rowLabel}</TextElement>

      {showFooter ? (
        <>
          <View style={styles.divider} />
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <CheererStack users={beat.sampleCheerers} />
              <View style={styles.cheerCountWrap}>
                <TextElement style={[styles.cheerCountText]}>
                  {cheerCount} {cheerCount === 1 ? 'cheer' : 'cheers'}
                </TextElement>
              </View>
            </View>

            {canCheer ? (
              <Ripple
                radius={22}
                disabled={isSendingCheer}
                onPress={() => onCheerPress?.(beat as GoalBeat)}
                style={styles.cheerButton}
              >
                <Icon
                  set="fa6"
                  name="bolt"
                  iconStyle="solid"
                  size={ms(11)}
                  color={colors.onboardingPushDeep}
                />
                <TextElement style={styles.cheerButtonText}>Cheer</TextElement>
              </Ripple>
            ) : beat.callerHasCheered ? (
              <View style={styles.cheeredPill}>
                <TextElement style={styles.cheeredPillText} numberOfLines={1}>
                  {beat.callerCheer?.presetText
                    ? `You cheered: "${beat.callerCheer.presetText}"`
                    : 'You cheered'}
                </TextElement>
              </View>
            ) : isOwner && cheerCount === 0 && onShareUpdate ? (
              <Ripple
                radius={22}
                onPress={() => onShareUpdate?.(beat as GoalBeat)}
                style={styles.cheerButton}
              >
                <Icon
                  set="ion"
                  name="share-social"
                  size={ms(12)}
                  color={colors.onboardingPushDeep}
                />
                <TextElement style={styles.cheerButtonText}>Share</TextElement>
              </Ripple>
            ) : !isCheeringOpen ? (
              <View style={styles.closedWrap}>
                {/* <Icon set="ion" name="lock-closed" size={ms(13)} color={colors.onboardingMuted} /> */}
                {/* <TextElement style={styles.closedText}>Cheering closed</TextElement> */}
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}

function PulsingDot() {
  const styles = useThemedStyles(createStyles);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const ringStyle = {
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
  };

  return (
    <View style={styles.dotWrap}>
      <Animated.View style={[styles.dotRing, ringStyle]} />
      <View style={styles.dotCore} />
    </View>
  );
}

function GapSeparator({ label }: { label: string | null }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!label) return null;

  return (
    <View style={styles.gapRow}>
      <View style={styles.gapLine} />
      <View style={styles.gapLabelWrap}>
        <Icon set="ion" name="arrow-up" size={ms(12)} color={colors.onboardingMuted} />
        <TextElement style={styles.gapText}>{label}</TextElement>
      </View>
      <View style={styles.gapLine} />
    </View>
  );
}

function CheererStack({ users }: { users?: AvatarUser[] }) {
  const cheerers = normalizeCheerers(users);
  if (!cheerers.length) return null;

  return <HelperAvatarStack helpers={cheerers} size={ms(24)} maxVisible={3} marginLeft={0.5} />;
}

function buildRows({
  beats,
  updates,
  taskText,
}: {
  beats?: GoalBeat[];
  updates?: ProgressUpdate[];
  taskText?: string;
}): TimelineBeat[] {
  const safeUpdates = (updates ?? []).filter(Boolean);
  // The original task is shown at the top of the screen, so exclude the
  // "posted this task" beat here to avoid duplicating it in the timeline.
  const safeBeats = (beats ?? []).filter(Boolean).filter(beat => beat.type !== 'post');

  if (safeBeats.length > 0) {
    return safeBeats
      .map(beat => {
        const update = findUpdateForBeat(beat, safeUpdates);
        const displayText =
          beat.type === 'post' ? (beat.text ?? taskText ?? '') : (beat.text ?? update?.text ?? '');
        const displayCreatedAt = beat.createdAt ?? update?.createdAt ?? '';

        return {
          ...beat,
          key: beat.beatId ?? beat.id ?? beat.updateId ?? displayCreatedAt,
          displayText,
          displayCreatedAt,
          displayLabel: 'shared an update.',
          type: beat.type,
        };
      })
      .sort((a, b) => getBeatSortTime(b) - getBeatSortTime(a));
  }

  return safeUpdates
    .map((update, index) => ({
      key: update.id ?? `${update.createdAt}-${index}`,
      updateId: update.id,
      type: 'update' as const,
      displayText: update.text,
      displayCreatedAt: update.createdAt,
      displayLabel: 'shared an update.',
    }))
    .sort((a, b) => getBeatSortTime(b) - getBeatSortTime(a));
}

function formatTimelineParts(dateISO: string) {
  const d = new Date(dateISO);
  if (!Number.isFinite(d.getTime())) return { date: '', time: '' };

  const now = new Date();
  const date =
    d.toDateString() === now.toDateString()
      ? 'TODAY'
      : d
          .toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
          .toUpperCase();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return { date, time };
}

function getGapLabel(
  prev: Pick<TimelineBeat, 'displayCreatedAt'>,
  next: Pick<TimelineBeat, 'displayCreatedAt'>,
): string | null {
  const a = new Date(prev.displayCreatedAt).getTime();
  const b = new Date(next.displayCreatedAt).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  const diff = Math.abs(b - a);
  const minutes = Math.round(diff / 60000);
  if (minutes < 5) return 'MOMENTS APART';
  if (minutes < 60) return `AFTER ${minutes} MIN`;

  const hours = Math.round(diff / 3600000);
  if (hours < 24) return `AFTER ${hours} ${hours === 1 ? 'HOUR' : 'HOURS'}`;

  const days = Math.round(diff / 86400000);
  return `AFTER ${days} ${days === 1 ? 'DAY' : 'DAYS'}`;
}

function getBeatSortTime(beat: Pick<TimelineBeat, 'displayCreatedAt'>) {
  const time = new Date(beat.displayCreatedAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isSameBeat(a?: string, b?: string) {
  return Boolean(a && b && a === b);
}

function matchesUpdate(beat: GoalBeat, update: ProgressUpdate) {
  if (!beat.updateId || !update.id) return false;

  return (
    isSameBeat(beat.updateId, update.id) ||
    isSameBeat(beat.updateId, beat.beatId) ||
    isSameBeat(beat.beatId, update.id)
  );
}

function findUpdateForBeat(beat: GoalBeat, updates: ProgressUpdate[]) {
  if (beat.type !== 'update') return undefined;

  const explicitMatch = updates.find(update => matchesUpdate(beat, update));
  if (explicitMatch) return explicitMatch;

  if (updates.length === 1) return updates[0];

  const beatTime = new Date(beat.createdAt).getTime();
  if (!Number.isFinite(beatTime)) return undefined;

  return updates.find(update => {
    const updateTime = new Date(update.createdAt).getTime();
    return Number.isFinite(updateTime) && Math.abs(updateTime - beatTime) < 1000;
  });
}

function normalizeCheerers(users?: AvatarUser[]) {
  return (users ?? []).map(user => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar ?? user.photo,
  }));
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: {
      backgroundColor: colors.onboardingPaper,
      // borderRadius: 26,
      // paddingHorizontal: ms(12),
      // paddingTop: vs(14),
      // paddingBottom: vs(14),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
      marginBottom: vs(16),
    },
    headerTitle: {
      fontSize: ms(17),
      lineHeight: ms(22),
      fontWeight: '900',
      color: colors.onboardingInk,
    },
    emptyWrap: {
      borderRadius: 18,
      backgroundColor: colors.onboardingCard,
      paddingHorizontal: ms(16),
      paddingVertical: vs(14),
    },
    emptyTitle: {
      fontSize: ms(15),
      lineHeight: ms(20),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    emptyBody: {
      marginTop: vs(4),
      fontSize: ms(13),
      lineHeight: ms(18),
      color: colors.onboardingMuted,
      fontWeight: '600',
    },
    card: {
      backgroundColor: colors.onboardingCard,
      borderRadius: 22,
      paddingHorizontal: ms(18),
      paddingTop: ms(10),
      paddingBottom: ms(14),
    },
    gapRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
      paddingVertical: vs(16),
    },
    gapLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.onboardingLine,
    },
    gapLabelWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(5),
      flexShrink: 0,
    },
    gapText: {
      fontSize: ms(11),
      lineHeight: ms(15),
      fontWeight: '900',
      letterSpacing: 0.8,
      color: colors.onboardingMuted,
    },
    showAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(6),
      marginTop: vs(12),
      paddingTop: vs(12),
      borderTopWidth: 1,
      borderTopColor: colors.onboardingLine,
    },
    showAllText: {
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '800',
      color: colors.onboardingPushDeep,
    },
    beatRow: {},
    dotWrap: {
      width: ms(9),
      height: ms(9),
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotCore: {
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      backgroundColor: colors.onboardingPushDeep,
    },
    dotRing: {
      position: 'absolute',
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      backgroundColor: colors.onboardingPush,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: ms(10),
      marginBottom: vs(4),
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(7),
      flexShrink: 0,
    },
    dateText: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '900',
      letterSpacing: 0.6,
      color: colors.placeHolder,
      flexShrink: 0,
    },
    dotSep: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '900',
      color: colors.onboardingLine,
    },
    clockText: {
      fontSize: ms(10),
      lineHeight: ms(15),
      fontWeight: '700',
      letterSpacing: 0.3,
      color: colors.onboardingMuted,
      flexShrink: 0,
    },
    clockTextMost: {
      // color: colors.onboardingPushDeep,
    },
    mostCheeredPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(5),
      flexShrink: 0,
      backgroundColor: colors.onboardingPush,
      borderRadius: 16,
      paddingHorizontal: ms(8),
      paddingVertical: vs(4),
    },
    mostCheeredText: {
      fontSize: ms(8),
      lineHeight: ms(14),
      fontWeight: '900',
      letterSpacing: 0.5,
      color: colors.tactileMomentumSecondary,
      textTransform: 'uppercase',
    },
    rowLabel: {
      fontSize: ms(10),
      lineHeight: ms(10),
      fontWeight: '700',
      color: colors.onboardingMuted,
    },
    beatText: {
      marginTop: vs(4),
      fontSize: ms(14),
      lineHeight: ms(15),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    divider: {
      backgroundColor: colors.onboardingLine,
      marginVertical: ms(6),
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: ms(8),
    },
    footerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      gap: ms(8),
    },
    cheerCountWrap: {
      // flexDirection: 'row',
      // alignItems: 'center',
      // gap: ms(6),
    },
    cheerCountText: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    cheerCountTextMost: {
      color: colors.onboardingPushDeep,
    },
    cheerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(6),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.onboardingPushDeep,
      backgroundColor: 'rgba(255, 210, 63, 0.14)',
      paddingHorizontal: ms(13),
      paddingVertical: vs(5),
      marginLeft: ms(6),
    },
    cheerButtonText: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    cheeredPill: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(237, 187, 23, 0.34)',
      backgroundColor: 'rgba(255, 210, 63, 0.16)',
      paddingHorizontal: ms(9),
      paddingVertical: vs(4),
    },
    cheeredPillText: {
      flexShrink: 1,
      fontSize: ms(10),
      lineHeight: ms(14),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    closedWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
    },
    closedText: {
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '800',
      color: colors.onboardingMuted,
    },
  });
