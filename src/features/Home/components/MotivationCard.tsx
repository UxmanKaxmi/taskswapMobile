import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { MotivationGoal } from '../types/home';
import {
  getFirstName,
  stripOuterQuotes,
  timeAgo,
  toShortName,
} from '@shared/utils/helperFunctions';
import { Shadow } from '@shared/components/Shadow';
import { useGoalPushes, useToggleGoalPush } from '@features/Goals/hooks/useGoalPush';
import HelperAvatarGroup from './HelperAvatarGroup';
import { GoalBeat, GoalTypeEnum } from '@features/Goals/types/goals';
import Avatar from '@shared/components/Avatar/Avatar';
import { getAvatarColor } from '@shared/utils/avatarColor';
import PushTicks from '@shared/components/PushTicks/PushTicks';
import PushButton from '@shared/components/PushButton';
import { useAuth } from '@features/Auth/AuthProvider';
import { usePushInteraction } from '../hooks/usePushInteraction';
import { getFeelingLabel } from '@shared/utils/feelings';
import { useGoalById } from '../hooks/useGoalById';
import { useModal } from '@shared/components/ModalProvider';
import { useSendCheer } from '@features/Goals/hooks/useGoalCheer';
import Icon from '@shared/components/Icons/Icon';
import { showToast } from '@shared/utils/toast';
import { CHEER_PRESETS } from '@features/Goals/constants/cheerPresets';

type Props = {
  task: MotivationGoal;
  onPressCard: (task: MotivationGoal) => void;
  onPressSuggest: (task: MotivationGoal) => void;
  onPressView: (task: MotivationGoal) => void;
  onPressShare?: (task: MotivationGoal) => void;
};

function MotivationCard({ task, onPressCard }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const { openCheerSheet, openModal } = useModal();
  const { avatar, name = 'John Doe', createdAt, text, helpers = [] } = task;
  const { data: pushData } = useGoalPushes(task.id);
  const { mutate: togglePush, isPending } = useToggleGoalPush(task.id);
  const sendCheer = useSendCheer(task.id);
  const cardNudgeX = useRef(new Animated.Value(0)).current;
  const actionProgress = useRef(new Animated.Value(task.hasPushed ? 1 : 0)).current;
  const pushConfirmationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks a push made in this session so we can show a brief confirmation
  // without the card disappearing from the "Needs a push" feed.
  const [justPushed, setJustPushed] = useState(false);
  const [localCheeredPhrase, setLocalCheeredPhrase] = useState<string | null>(null);

  const isOwner = task.userId === user?.id;
  const hasPushed = pushData?.hasPushed ?? task.hasPushed ?? false;
  const pushCount = Math.max(
    pushData?.pushCount ?? task.pushCount ?? 0,
    (task.pushCount ?? 0) + (!hasPushed && justPushed ? 1 : 0),
  );
  const taskBeats = task.beats ?? [];
  const feelingLabel = useMemo(() => buildFeelingLabel(task), [task]);
  const avatarColor = useMemo(
    () => task.avatarColor ?? getAvatarColor(task.userId || name),
    [name, task.avatarColor, task.userId],
  );
  const feedProgressText =
    task?.progressUpdates
      ?.map(update => stripOuterQuotes(update?.text ?? '').trim())
      .find(Boolean) ?? '';
  const { data: fullGoal } = useGoalById(task.id, !feedProgressText || taskBeats.length === 0);
  const beats = taskBeats.length > 0 ? taskBeats : (fullGoal?.beats ?? []);
  const latestCheerableBeat = useMemo(() => getLatestCheerableBeat(beats), [beats]);
  const progressText =
    feedProgressText ||
    (fullGoal?.progressUpdates
      ?.map(update => stripOuterQuotes(update?.text ?? '').trim())
      .find(Boolean) ??
      '');

  const triggerCardNudge = useCallback(() => {
    cardNudgeX.stopAnimation(() => {
      cardNudgeX.setValue(0);

      Animated.sequence([
        Animated.timing(cardNudgeX, {
          toValue: 7,
          duration: 120,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
          useNativeDriver: true,
        }),
        Animated.timing(cardNudgeX, {
          toValue: 0,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [cardNudgeX]);

  const handleOnPush = useCallback(() => {
    triggerCardNudge();
    setJustPushed(true);
    if (pushConfirmationTimerRef.current) {
      clearTimeout(pushConfirmationTimerRef.current);
    }
    pushConfirmationTimerRef.current = setTimeout(() => {
      pushConfirmationTimerRef.current = null;
    }, 1500);
    togglePush();
  }, [togglePush, triggerCardNudge]);

  useEffect(
    () => () => {
      if (pushConfirmationTimerRef.current) {
        clearTimeout(pushConfirmationTimerRef.current);
      }
    },
    [],
  );

  const { handlePush } = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: handleOnPush,
    onUnpush: togglePush,
    isPushing: isPending,
    pushToast: {
      pusherName: 'You',
      message: `just pushed ${toShortName(name)} forward`,
    },
  });
  const latestBeatCheeringOpen = Boolean(
    latestCheerableBeat?.isCheeringOpen === true ||
    (latestCheerableBeat?.isLatest && latestCheerableBeat?.isCheeringOpen !== false),
  );
  const canShowCheer =
    !isOwner &&
    !task.completed &&
    !task.completedAt &&
    (hasPushed || justPushed) &&
    Boolean(latestCheerableBeat?.beatId) &&
    latestBeatCheeringOpen &&
    !latestCheerableBeat?.callerHasCheered;
  const hasCheeredLatest = Boolean(latestCheerableBeat?.callerHasCheered);
  const cheeredPhrase = localCheeredPhrase ?? latestCheerableBeat?.callerCheer?.presetText ?? null;
  const isCheered = Boolean(hasCheeredLatest || localCheeredPhrase);
  const baseCheerTotal =
    task.cheerTotal ?? beats.reduce((total, beat) => total + (beat.cheerCount ?? 0), 0);
  const visibleCheerTotal =
    baseCheerTotal + (localCheeredPhrase && !latestCheerableBeat?.callerHasCheered ? 1 : 0);
  const shouldShowCheerStrip = canShowCheer || isCheered;

  useEffect(() => {
    setLocalCheeredPhrase(null);
  }, [latestCheerableBeat?.beatId]);

  useEffect(() => {
    Animated.spring(actionProgress, {
      toValue: shouldShowCheerStrip ? 1 : 0,
      damping: 18,
      stiffness: 190,
      mass: 0.72,
      useNativeDriver: true,
    }).start();
  }, [actionProgress, shouldShowCheerStrip]);

  const cheerStripStyle = useMemo(
    () => ({
      opacity: actionProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateY: actionProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [vs(8), 0],
          }),
        },
        {
          scale: actionProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.98, 1],
          }),
        },
      ],
    }),
    [actionProgress],
  );

  const handleCheerPress = useCallback(() => {
    if (!latestCheerableBeat?.beatId) return;

    openCheerSheet({
      ownerName: getFirstName(name),
      taskText: stripOuterQuotes(latestCheerableBeat.text || text),
      beatType: latestCheerableBeat.type,
      onSelectPreset: presetKey =>
        new Promise<void>((resolve, reject) => {
          sendCheer.mutate(
            {
              beatId: latestCheerableBeat.beatId,
              presetKey,
            },
            {
              onSuccess: cheerState => {
                const presetText =
                  cheerState.callerCheer?.presetText ??
                  CHEER_PRESETS.find(preset => preset.key === presetKey)?.text ??
                  null;
                setLocalCheeredPhrase(presetText);
                resolve();
              },
              onError: (err: any) => {
                const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
                showToast({
                  type: 'error',
                  title: 'Cheer not sent',
                  message: apiMessage || 'Could not send your cheer. Try again.',
                });
                reject(err);
              },
            },
          );
        }),
    });
  }, [latestCheerableBeat, name, openCheerSheet, sendCheer]);

  const handleAnonymousBadgePress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      openModal('anonymousPostingInfo', {
        userName: user?.name ?? 'you',
        mode: 'posted',
        primaryActionLabel: 'Got it',
        hideSecondaryAction: true,
      });
    },
    [openModal, user?.name],
  );

  return (
    <Animated.View style={{ transform: [{ translateX: cardNudgeX }] }}>
      <Shadow size="tint" color="rgba(0, 0, 0, 0.08)" style={styles.shadowWrap}>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => onPressCard(task)}
          >
            <View style={styles.headerRow}>
              <View style={styles.identityRow}>
                <View style={styles.avatarWrap}>
                  <Avatar
                    uri={avatar || null}
                    fallback={name}
                    size={ms(42)}
                    borderColor={colors.onboardingCard}
                    fallbackStyle={{ ...styles.avatarFallback, backgroundColor: avatarColor }}
                    textStyle={styles.avatarText}
                  />

                  {helpers.length > 0 && (
                    <HelperAvatarGroup
                      helpers={helpers}
                      avatarSize={ms(18)}
                      containerStyle={styles.helperOverlay}
                    />
                  )}
                </View>

                <View style={styles.identityTextBlock}>
                  <View style={styles.nameRow}>
                    <TextElement style={styles.name}>{toShortName(name)}</TextElement>
                    {task.isAnonymous && isOwner ? (
                      <Pressable
                        onPress={handleAnonymousBadgePress}
                        accessibilityRole="button"
                        accessibilityLabel="Anonymous posting info"
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.anonBadge,
                          pressed && styles.anonBadgePressed,
                        ]}
                      >
                        <TextElement style={styles.anonBadgeText}>Anonymous</TextElement>
                      </Pressable>
                    ) : null}
                  </View>
                  <TextElement style={styles.timeText}>{timeAgo(createdAt)}</TextElement>
                </View>
              </View>

              <View style={styles.headerRight}>
                <View style={styles.feelingPill}>
                  <TextElement style={styles.feelingText}>{feelingLabel}</TextElement>
                </View>
              </View>
            </View>

            <TextElement style={styles.taskText}>{stripOuterQuotes(text)}</TextElement>

            {progressText ? (
              <View style={styles.progressBlock}>
                <View style={styles.progressAccent} />
                <View style={styles.progressTextBlock}>
                  <TextElement variant="title" weight="700" style={styles.progressLabel}>
                    PROGRESS
                  </TextElement>
                  <TextElement style={styles.progressText}>{progressText}</TextElement>
                </View>
              </View>
            ) : null}

            <View
              style={[
                styles.footerRow,
                progressText ? { marginTop: spacing.md } : { marginTop: spacing.md },
              ]}
            >
              <View style={styles.footerLeft}>
                {pushCount > 0 ? (
                  <PushTicks
                    count={pushCount}
                    animateNonce={pushCount}
                    replayOnNonceChange={false}
                    style={styles.ticks}
                  />
                ) : (
                  <TextElement style={styles.noPushes}>No pushes yet</TextElement>
                )}
                {pushCount > 0 && (
                  <TextElement style={styles.countLine}>
                    <TextElement style={styles.countStrong}>
                      {pushCount} {pushCount === 1 ? 'push' : 'pushes'}
                    </TextElement>
                    {visibleCheerTotal > 0 ? (
                      <TextElement style={styles.countMuted}>
                        {' '}
                        · {visibleCheerTotal} {visibleCheerTotal === 1 ? 'cheer' : 'cheers'}
                      </TextElement>
                    ) : null}
                  </TextElement>
                )}
              </View>

              {!isOwner && (
                <PushButton
                  onPress={handlePush}
                  loading={isPending}
                  active={hasPushed || justPushed}
                  taskType={GoalTypeEnum.Motivation}
                  variant="push"
                  label="Push"
                  activeLabel="Pushed"
                  size="sm"
                  buttonStyle={styles.pushButton}
                  textStyle={styles.pushButtonText}
                />
              )}
            </View>
          </Pressable>

          {!isOwner && shouldShowCheerStrip && (
            <Animated.View pointerEvents="auto" style={[styles.cheerStrip, cheerStripStyle as any]}>
              {isCheered ? (
                <View style={styles.cheeredInline}>
                  <Icon
                    set="fa6"
                    name="check"
                    iconStyle="solid"
                    size={ms(13)}
                    color={colors.onboardingPushDeep}
                  />
                  <TextElement style={styles.cheeredInlineText}>
                    {cheeredPhrase ? `You cheered: "${cheeredPhrase}"` : 'Cheered'}
                  </TextElement>
                </View>
              ) : (
                <Pressable
                  disabled={sendCheer.isPending}
                  onPress={handleCheerPress}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.cheerOpenButton,
                    pressed && styles.cheerOpenButtonPressed,
                    sendCheer.isPending && styles.cheerOpenButtonDisabled,
                  ]}
                >
                  <Icon
                    set="fa6"
                    name="bolt"
                    iconStyle="solid"
                    size={ms(13)}
                    color={colors.onboardingPushDeep}
                  />
                  <TextElement style={styles.cheerOpenText}>Cheer</TextElement>
                </Pressable>
              )}
            </Animated.View>
          )}
        </View>
      </Shadow>
    </Animated.View>
  );
}

export default React.memo(MotivationCard);

function buildFeelingLabel(task: MotivationGoal) {
  const explicit = getFeelingLabel(task.feeling);
  if (explicit) return explicit;

  const progressCount = task.progressUpdates?.length ?? 0;
  const pushCount = task.pushCount ?? 0;

  if (progressCount > 0) return 'Making progress';
  if (pushCount === 0) return 'Feeling stuck';
  if (pushCount < 5) return 'Avoiding it';
  if (pushCount < 12) return 'Nervous';
  return 'Momentum';
}

function getLatestCheerableBeat(beats?: GoalBeat[]): GoalBeat | null {
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    shadowWrap: {
      borderRadius: 28,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    card: {
      borderRadius: 28,
      backgroundColor: colors.onboardingCard,
      paddingHorizontal: ms(20),
      paddingVertical: vs(18),
      borderWidth: 1,
      borderColor: colors.onboardingLine,
    },
    pressed: {
      opacity: 0.96,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    identityRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      gap: spacing.sm,
    },
    avatarWrap: {
      position: 'relative',
      width: ms(42),
      height: ms(42),
      flexShrink: 0,
    },
    avatarFallback: {
      borderWidth: 0,
    },
    avatarText: {
      color: colors.tactileMomentumSecondary,
      fontWeight: '800',
    },
    helperOverlay: {
      position: 'absolute',
      bottom: ms(-4),
      right: ms(-3),
    },
    identityTextBlock: {
      flex: 1,
      paddingTop: vs(2),
    },
    name: {
      fontSize: ms(16),
      lineHeight: ms(19),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(4),
    },
    anonBadge: {
      backgroundColor: colors.muted + '22',
      borderRadius: 999,
      paddingHorizontal: ms(5),
      paddingVertical: vs(0.5),
    },
    anonBadgePressed: {
      opacity: 0.7,
    },
    anonBadgeText: {
      color: colors.muted,
      fontSize: ms(8),
      lineHeight: ms(11),
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    timeText: {
      // marginTop: vs(2),
      fontSize: ms(13),
      lineHeight: ms(16),
      color: colors.onboardingMuted,
      fontWeight: '500',
    },
    feelingPill: {
      paddingHorizontal: ms(12),
      paddingVertical: vs(4),
      borderRadius: 999,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      flexShrink: 0,
    },
    feelingText: {
      fontSize: ms(12),
      lineHeight: ms(14),
      color: colors.onboardingInkSoft,
      fontWeight: '700',
    },
    taskText: {
      marginTop: spacing.sm,
      color: colors.onboardingInk,
      fontSize: ms(20),
      lineHeight: ms(24),
      fontWeight: '700',
      letterSpacing: 0,
    },
    progressBlock: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingRight: spacing.sm,
      backgroundColor: colors.background,
      borderRadius: 12,
      overflow: 'hidden',
    },
    progressAccent: {
      width: ms(6),
      backgroundColor: colors.motivationBgHardest,
    },
    progressTextBlock: {
      paddingVertical: vs(6),
      paddingLeft: spacing.sm,
      flex: 1,
    },
    progressLabel: {
      fontSize: ms(12),
      lineHeight: ms(14),
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontWeight: '900',
      color: colors.motivationBgHardest,
      // marginBottom: vs(4),
    },
    progressText: {
      fontSize: ms(14),
      lineHeight: ms(20),
      color: colors.onboardingInkSoft,
      fontWeight: '500',
    },
    footerRow: {
      // marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    footerLeft: {
      flex: 1,
      minHeight: ms(36),
      justifyContent: 'flex-end',
    },
    ticks: {
      marginBottom: vs(2),
    },
    countLine: {
      marginTop: vs(5),
      fontSize: ms(12),
      lineHeight: ms(16),
      color: colors.onboardingMuted,
      fontWeight: '500',
    },
    countStrong: {
      fontSize: ms(12),
      lineHeight: ms(16),
      color: colors.onboardingInk,
      fontWeight: '800',
    },
    countMuted: {
      fontSize: ms(12),
      lineHeight: ms(16),
      color: colors.onboardingMuted,
      fontWeight: '500',
    },
    noPushes: {
      fontSize: ms(13),
      lineHeight: ms(17),
      color: 'rgba(118, 121, 128, 0.7)',
      fontWeight: '500',
    },
    pushButton: {
      minWidth: ms(90),
      paddingHorizontal: ms(14),
      paddingVertical: vs(8),
      justifyContent: 'center',
    },
    pushButtonText: {
      fontSize: ms(14),
      lineHeight: ms(17),
      fontWeight: '800',
    },
    cheerStrip: {
      marginTop: vs(13),
      borderTopWidth: 1,
      borderTopColor: colors.onboardingLine,
      paddingTop: vs(12),
      alignItems: 'flex-start',
    },
    cheerOpenButton: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.onboardingPushDeep,
      backgroundColor: 'rgba(255, 210, 63, 0.14)',
      paddingHorizontal: ms(18),
      paddingVertical: vs(6),
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
    },
    cheerOpenButtonPressed: {
      opacity: 0.65,
    },
    cheerOpenButtonDisabled: {
      opacity: 0.45,
    },
    cheerOpenText: {
      fontSize: ms(14),
      lineHeight: ms(20),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    cheeredInline: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(237, 187, 23, 0.34)',
      backgroundColor: 'rgba(255, 210, 63, 0.16)',
      paddingHorizontal: ms(12),
      paddingVertical: vs(8),
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
    },
    cheeredInlineText: {
      flexShrink: 1,
      fontSize: ms(12),
      lineHeight: ms(17),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
  });
