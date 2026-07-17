import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { ms, vs } from 'react-native-size-matters';

import { Layout } from '@shared/components/Layout';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import BackButton from '@shared/components/Buttons/BackButton';
import Ripple from '@shared/components/Buttons/Ripple';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import AnimatedBottomButtonWithHeader, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButtonWithHeader';
import ShareModal, { type CircleSharePayload } from '@features/Share/components/ShareModal';
import MotivationStatsHeader from '@features/GoalDetail/components/MotivationStatsHeader';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { AppStackParamList } from '@navigation/types/navigation';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useAuth } from '@features/Auth/AuthProvider';
import { useModal } from '@shared/components/ModalProvider';
import { showPushToast, showToast } from '@shared/utils/toast';

import CircleAvatarStack from '../components/CircleAvatarStack';
import CircleLaneCard from '../components/CircleLaneCard';
import CircleActivityTimeline from '../components/CircleActivityTimeline';
import CircleOverflowMenu from '../components/CircleOverflowMenu';
import CircleUpdateSheet from '../components/CircleUpdateSheet';
import { toShareableInviteLink } from '../utils/inviteLink';
import {
  useCircleQuery,
  useCreateCircleInvite,
  useLeaveCircle,
  useNudgeMember,
  usePushAllCircle,
  usePushCircleLane,
  useReactToUpdate,
  useShareCircleUpdate,
} from '../hooks/useCircles';
import { getFirstName, stripOuterQuotes, toShortName } from '@shared/utils/helperFunctions';
import { formatRoster } from '../utils/roster';
import { getCircleDayNumber } from '../utils/circleDay';
import type { CircleActivityEvent, CircleLane } from '../types/circles.types';

type DetailView = 'circle' | 'activity';

type Props = NativeStackScreenProps<AppStackParamList, 'CircleDetail'>;

const CIRCLE_DETAIL_FOOTER_HEIGHT = BOTTOM_BUTTON_HEIGHT + vs(44);

export default function CircleDetailScreen({ navigation, route }: Props) {
  const { circleId } = route.params;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const { openCheerSheet } = useModal();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const queryClient = useQueryClient();

  const { data: circle, isLoading, isError } = useCircleQuery(circleId);
  const pushLane = usePushCircleLane(circleId);
  const pushAll = usePushAllCircle(circleId, user?.id);
  const leaveCircle = useLeaveCircle(circleId);
  const createInvite = useCreateCircleInvite(circleId);
  const nudgeMember = useNudgeMember(circleId);
  const reactToUpdate = useReactToUpdate(circleId);
  const shareUpdate = useShareCircleUpdate(circleId);

  const [view, setView] = useState<DetailView>('circle');
  const [updateSheetVisible, setUpdateSheetVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const isComplete = circle?.status === 'complete';
  const isDissolved = circle?.status === 'dissolved';
  const isMember = Boolean(circle?.viewer.isMember);

  // Fresh member state whenever the screen regains focus (A4 pattern).
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.circleById(circleId) });
    }, [circleId, queryClient]),
  );

  const onPressLane = useCallback(
    (lane: CircleLane) => {
      if (!lane.taskId) return;
      navigation.navigate('GoalDetail', { taskId: lane.taskId });
    },
    [navigation],
  );

  const onPressPush = useCallback(
    (lane: CircleLane) => {
      if (!checkAuthThenNavigate()) return;
      if (!lane.taskId || lane.hasPushed) return;
      pushLane.mutate(
        { taskId: lane.taskId },
        {
          onSuccess: () => {
            showPushToast({
              pusherName: 'You',
              message: `just pushed ${toShortName(lane.name)} forward`,
            });
          },
        },
      );
    },
    [checkAuthThenNavigate, pushLane],
  );

  const onPressNudge = useCallback(
    (lane: CircleLane) => {
      if (!checkAuthThenNavigate()) return;
      if (lane.viewerHasNudged) return;
      nudgeMember.mutate(
        { userId: lane.userId },
        {
          onSuccess: () => {
            showToast({
              type: 'success',
              title: `You nudged ${getFirstName(lane.name)}. A quiet "thinking of you".`,
            });
          },
        },
      );
    },
    [checkAuthThenNavigate, nudgeMember],
  );

  // Exact same cheer flow as the single-goal screen: the preset sheet opens
  // and the chosen preset lands on the update's beat.
  const onPressReact = useCallback(
    (lane: CircleLane) => {
      if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Cheer' })) return;
      const update = lane.latestUpdate;
      if (!update?.beatId || update.viewerHasCheered) return;
      const beatId = update.beatId;

      openCheerSheet({
        ownerName: getFirstName(lane.name || 'them'),
        taskText: stripOuterQuotes(update.text),
        beatType: 'update',
        onSelectPreset: presetKey =>
          new Promise<void>((resolve, reject) => {
            reactToUpdate.mutate(
              { beatId, presetKey },
              {
                onSuccess: () => resolve(),
                onError: err => reject(err),
              },
            );
          }),
      });
    },
    [checkAuthThenNavigate, openCheerSheet, reactToUpdate],
  );

  // Cheer straight from the timeline: updates open the sheet on their update
  // beat, done wins on the member's post beat. Same sheet, same machinery.
  const onPressCheerEvent = useCallback(
    (event: CircleActivityEvent) => {
      if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Cheer' })) return;
      if (!event.beatId || event.viewerHasCheered) return;
      const beatId = event.beatId;

      openCheerSheet({
        ownerName: getFirstName(event.name || 'them'),
        taskText:
          event.kind === 'update' && event.text
            ? stripOuterQuotes(event.text)
            : stripOuterQuotes(circle?.goalText ?? ''),
        beatType: event.kind === 'update' ? 'update' : 'post',
        onSelectPreset: presetKey =>
          new Promise<void>((resolve, reject) => {
            reactToUpdate.mutate(
              { beatId, presetKey },
              {
                onSuccess: () => resolve(),
                onError: err => reject(err),
              },
            );
          }),
      });
    },
    [checkAuthThenNavigate, circle?.goalText, openCheerSheet, reactToUpdate],
  );

  const viewerLane = useMemo(
    () => circle?.lanes.find(lane => lane.userId === user?.id) ?? null,
    [circle?.lanes, user?.id],
  );

  // Members with nothing shared today (prototype C1): one card, one button,
  // a nudge for each of them.
  const quietLanes = useMemo(() => {
    if (!circle) return [];
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    return circle.lanes.filter(
      lane =>
        lane.userId !== user?.id &&
        lane.state !== 'done' &&
        !lane.completed &&
        (!lane.latestUpdate || Date.parse(lane.latestUpdate.createdAt) < dayStartMs),
    );
  }, [circle, user?.id]);
  const allQuietNudged = quietLanes.length > 0 && quietLanes.every(lane => lane.viewerHasNudged);

  const onPressNudgeQuiet = useCallback(async () => {
    if (!checkAuthThenNavigate()) return;
    const targets = quietLanes.filter(lane => !lane.viewerHasNudged);
    if (targets.length === 0) return;
    try {
      for (const lane of targets) {
        await nudgeMember.mutateAsync({ userId: lane.userId });
      }
      showToast({
        type: 'success',
        title: `You nudged ${formatRoster(targets.map(lane => lane.name))}. A quiet "thinking of you".`,
      });
    } catch {
      // useNudgeMember already surfaces the error toast.
    }
  }, [checkAuthThenNavigate, nudgeMember, quietLanes]);

  const onPostUpdate = useCallback(
    (text: string) => {
      if (!viewerLane?.taskId) return;
      setUpdateSheetVisible(false);
      shareUpdate.mutate({ taskId: viewerLane.taskId, text });
    },
    [shareUpdate, viewerLane?.taskId],
  );

  const onPressPushAll = useCallback(() => {
    if (!checkAuthThenNavigate()) return;
    pushAll.mutate(undefined, {
      onSuccess: result => {
        if (result.pushed.length > 0) {
          showPushToast({
            pusherName: 'You',
            message: isMember ? 'just pushed the others forward' : 'just pushed everyone forward',
          });
        }
      },
    });
  }, [checkAuthThenNavigate, isMember, pushAll]);

  const onPressInvite = useCallback(() => {
    createInvite.mutate(undefined, {
      onSuccess: invite => {
        void Share.share({
          message: `Hey. I'm doing "${circle?.goalText}" with friends on PushMeUp and there's a spot left. Join us: ${toShareableInviteLink(invite.inviteLink)}`,
        });
      },
    });
  }, [circle?.goalText, createInvite]);

  const onPressLeave = useCallback(() => {
    Alert.alert(
      'Leave this circle?',
      'Your goal keeps going solo with all its history. Nobody is notified.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave circle',
          style: 'destructive',
          onPress: () =>
            leaveCircle.mutate(undefined, {
              onSuccess: () => navigation.goBack(),
            }),
        },
      ],
    );
  }, [leaveCircle, navigation]);

  // Same full-screen share experience as the goal detail (poster included).
  const onPressShareWin = useCallback(() => {
    setShareVisible(true);
  }, []);

  const viewerLaneDone = circle?.lanes.some(
    lane => lane.userId === user?.id && lane.state === 'done',
  );
  const pushableLanes =
    circle?.lanes.filter(
      lane =>
        lane.taskId &&
        !lane.hasPushed &&
        lane.userId !== user?.id &&
        lane.state !== 'done' &&
        !lane.completed,
    ) ?? [];
  const allPushed = pushableLanes.length === 0;

  const sharePayload = useMemo<CircleSharePayload | null>(() => {
    if (!circle) return null;
    return {
      id: circle.id,
      goalText: circle.goalText,
      createdAt: circle.createdAt,
      totalPushes: circle.totalPushes,
      memberCount: circle.lanes.length,
      doneCount: circle.doneCount,
      isComplete: circle.status === 'complete',
      viewerIsMember: circle.viewer.isMember,
      members: circle.lanes.map(lane => ({
        userId: lane.userId,
        name: lane.name,
        avatar: lane.avatar,
      })),
    };
  }, [circle]);

  // Push-all rides the same animated bottom bar as the goal detail; it only
  // exists while there is someone left to push.
  const showPushAllFooter =
    Boolean(circle) && circle?.status === 'active' && !allPushed && !isLoading;

  return (
    <Layout
      scrollable
      allowPaddingVertical={false}
      backgroundColor={colors.onboardingPaper}
      style={styles.container}
      scrollViewProps={
        showPushAllFooter ? undefined : { contentContainerStyle: styles.scrollContentWithoutFooter }
      }
      footerHeight={showPushAllFooter ? CIRCLE_DETAIL_FOOTER_HEIGHT : 0}
      footerContent={
        showPushAllFooter ? (
          <AnimatedBottomButtonWithHeader
            visible
            title={isMember ? 'Push others' : 'Push them all'}
            onPress={onPressPushAll}
            isLoading={pushAll.isPending}
            buttonColor={colors.onboardingPush}
            textColor={colors.tactileMomentumSecondary}
            containerColor={colors.onboardingCard}
            buttonHeader="One tap sends a push to everyone still at it."
          />
        ) : null
      }
    >
      <AppHeader
        left={<BackButton onPress={() => navigation.goBack()} />}
        right={
          circle ? (
            <View style={styles.headerActions}>
              <Ripple style={styles.headerAction} onPress={() => setShareVisible(true)}>
                <Icon
                  set="ion"
                  name="share-social-outline"
                  size={ms(18)}
                  color={colors.onboardingInk}
                />
              </Ripple>
              <CircleOverflowMenu
                circleId={circleId}
                goalText={circle.goalText}
                lanes={circle.lanes}
                isMember={isMember && !isComplete && !isDissolved}
                onLeave={onPressLeave}
              />
            </View>
          ) : null
        }
      />

      {isLoading ? (
        <TextElement variant="body" color="muted" style={styles.stateText}>
          Loading the circle...
        </TextElement>
      ) : null}

      {isError ? (
        <TextElement variant="body" color="muted" style={styles.stateText}>
          This circle isn't available.
        </TextElement>
      ) : null}

      {circle ? (
        <>
          <View style={styles.headerBlock}>
            <View style={styles.headerTagRow}>
              <View style={styles.avatarRing}>
                <CircleAvatarStack members={circle.lanes} size={28} />
              </View>
              <View style={styles.circleTag}>
                <Icon
                  set="fa6"
                  name="circle-dot"
                  iconStyle="solid"
                  size={ms(10)}
                  color={colors.circleAccent}
                />
                <TextElement variant="caption" weight="800" style={styles.circleTagText}>
                  CIRCLE · DAY {getCircleDayNumber(circle.createdAt)}
                </TextElement>
              </View>
            </View>

            <TextElement variant="headline" weight="800" style={styles.sentence}>
              “{circle.goalText}”
            </TextElement>

            {circle.lanes.length > 1 ? (
              <TextElement variant="bodySmall" color="muted" style={styles.rosterLine}>
                <TextElement variant="bodySmall" weight="700" style={styles.rosterNames}>
                  {formatRoster(circle.lanes.map(lane => lane.name))}
                </TextElement>{' '}
                are in this together.
              </TextElement>
            ) : null}

            {isComplete ? (
              <View style={styles.winBlock}>
                <TextElement variant="headline" weight="900" style={styles.winTitle}>
                  {circle.doneCount} of us said we'd do it.{'\n'}
                  {circle.doneCount} of us did.
                </TextElement>
                <Pressable style={styles.primaryCta} onPress={onPressShareWin}>
                  <TextElement variant="subtitle" weight="700" style={styles.primaryCtaText}>
                    Share the win
                  </TextElement>
                </Pressable>
              </View>
            ) : (
              // Same stat boxes (and push ticks) as the goal detail. The
              // push-all CTA lives in the animated bottom bar.
              <MotivationStatsHeader
                createdAt={circle.createdAt}
                pushCount={circle.totalPushes}
                pushesLabel={
                  circle.totalPushes === 1 ? 'push across the circle' : 'pushes across the circle'
                }
              />
            )}
          </View>

          <View style={styles.segRow}>
            <Pressable
              style={[styles.segButton, view === 'circle' && styles.segButtonOn]}
              onPress={() => setView('circle')}
              accessibilityRole="tab"
              accessibilityState={{ selected: view === 'circle' }}
            >
              <TextElement
                variant="bodySmall"
                weight="700"
                style={view === 'circle' ? styles.segTextOn : styles.segText}
              >
                The circle
              </TextElement>
            </Pressable>
            <Pressable
              style={[styles.segButton, view === 'activity' && styles.segButtonOn]}
              onPress={() => setView('activity')}
              accessibilityRole="tab"
              accessibilityState={{ selected: view === 'activity' }}
            >
              <TextElement
                variant="bodySmall"
                weight="700"
                style={view === 'activity' ? styles.segTextOn : styles.segText}
              >
                Activity
              </TextElement>
            </Pressable>
          </View>

          {view === 'circle' ? (
            <>
              {circle.lanes.map(lane => (
                <CircleLaneCard
                  key={lane.memberId}
                  lane={lane}
                  isViewerLane={lane.userId === user?.id}
                  onPressLane={onPressLane}
                  onPressPush={onPressPush}
                  onPressNudge={onPressNudge}
                  onPressReact={onPressReact}
                  onPressShareUpdate={() => setUpdateSheetVisible(true)}
                  isPushing={pushLane.isPending}
                />
              ))}

              {isMember && !isComplete && !isDissolved && quietLanes.length > 0 ? (
                <View style={styles.quietCard}>
                  <TextElement variant="bodySmall" style={styles.quietText}>
                    👋{' '}
                    <TextElement variant="bodySmall" weight="700" style={styles.quietNames}>
                      {formatRoster(quietLanes.map(lane => lane.name))}
                    </TextElement>
                    {quietLanes.length === 1 ? ' is' : ' are'} quiet today. A nudge says you're
                    thinking of them.
                  </TextElement>
                  <Pressable
                    style={[styles.quietButton, allQuietNudged && styles.quietButtonDone]}
                    disabled={allQuietNudged || nudgeMember.isPending}
                    onPress={onPressNudgeQuiet}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: allQuietNudged }}
                    accessibilityLabel={
                      allQuietNudged ? 'Already nudged today' : 'Nudge everyone quiet today'
                    }
                  >
                    <TextElement
                      variant="bodySmall"
                      weight="700"
                      style={allQuietNudged ? styles.quietButtonTextDone : styles.quietButtonText}
                    >
                      {allQuietNudged ? 'Nudged ✓' : 'Nudge them'}
                    </TextElement>
                  </Pressable>
                </View>
              ) : null}

              {isMember && !isComplete && !isDissolved && circle.hasOpenSeats && !viewerLaneDone ? (
                <Pressable style={styles.inviteCta} onPress={onPressInvite}>
                  <Icon set="ion" name="person-add" size={ms(14)} color={colors.onboardingInk} />
                  <TextElement variant="bodySmall" weight="700" style={styles.inviteCtaText}>
                    Invite one more
                  </TextElement>
                </Pressable>
              ) : null}
            </>
          ) : (
            <>
              <TextElement variant="caption" color="muted" style={styles.activityHint}>
                Only the good stuff. Quiet stays quiet here.
              </TextElement>
              <CircleActivityTimeline
                events={circle.activity}
                viewerUserId={user?.id}
                onPressCheer={onPressCheerEvent}
              />
            </>
          )}

          {isDissolved ? (
            <TextElement variant="caption" color="muted" style={styles.dissolvedNote}>
              This circle wound down. Everyone's goals kept their history.
            </TextElement>
          ) : null}

          <CircleUpdateSheet
            visible={updateSheetVisible}
            onClose={() => setUpdateSheetVisible(false)}
            onPost={onPostUpdate}
            isPosting={shareUpdate.isPending}
          />

          <ShareModal
            visible={shareVisible}
            circle={sharePayload ?? undefined}
            onClose={() => setShareVisible(false)}
          />
        </>
      ) : null}
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.onboardingPaper,
      marginHorizontal: spacing.sm,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    headerAction: {
      paddingHorizontal: ms(5),
    },
    stateText: {
      marginTop: vs(40),
      textAlign: 'center',
    },
    scrollContentWithoutFooter: {
      paddingBottom: vs(40),
    },
    headerBlock: {
      marginTop: vs(4),
    },
    headerTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
      marginBottom: vs(8),
    },
    avatarRing: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      padding: ms(3),
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.circleAccentLine,
      backgroundColor: colors.circleAccentGhost,
    },
    circleTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(5),
      backgroundColor: colors.circleAccentSoft,
      borderRadius: 999,
      paddingVertical: vs(4),
      paddingHorizontal: ms(11),
    },
    circleTagText: {
      fontSize: ms(9.5),
      letterSpacing: 1.1,
      color: colors.circleAccent,
    },
    quietCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(12),
      backgroundColor: colors.onboardingCard,
      borderRadius: 22,
      paddingVertical: vs(13),
      paddingHorizontal: ms(16),
      marginBottom: spacing.md,
    },
    quietText: {
      flex: 1,
      fontSize: ms(12.5),
      lineHeight: ms(18),
      color: colors.text,
    },
    quietNames: {
      fontSize: ms(12.5),
      lineHeight: ms(18),
      color: colors.onboardingInk,
    },
    quietButton: {
      borderWidth: 1.5,
      borderColor: colors.onboardingLine,
      borderRadius: 999,
      paddingVertical: vs(8),
      paddingHorizontal: ms(14),
      backgroundColor: colors.onboardingCard,
    },
    quietButtonDone: {
      backgroundColor: colors.onboardingPaper,
      borderColor: 'transparent',
    },
    quietButtonText: {
      fontSize: ms(12.5),
      color: colors.text,
    },
    quietButtonTextDone: {
      fontSize: ms(12.5),
      color: colors.muted,
    },
    sentence: {
      fontSize: ms(19),
      lineHeight: ms(25),
      letterSpacing: -0.4,
      color: colors.onboardingInk,
      marginBottom: vs(8),
    },
    winBlock: {
      marginBottom: vs(8),
    },
    winTitle: {
      fontSize: ms(24),
      lineHeight: ms(30),
      letterSpacing: -0.5,
      color: colors.onboardingInk,
      marginBottom: vs(14),
    },
    rosterLine: {
      marginTop: vs(-4),
      marginBottom: vs(10),
      fontSize: ms(12),
    },
    rosterNames: {
      fontSize: ms(12.5),
      color: colors.onboardingInk,
    },
    segRow: {
      flexDirection: 'row',
      backgroundColor: colors.onboardingLine,
      borderRadius: 999,
      padding: ms(3),
      marginTop: vs(10),
      marginBottom: vs(8),
    },
    segButton: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: vs(6),
      alignItems: 'center',
    },
    segButtonOn: {
      backgroundColor: colors.card,
    },
    segText: {
      color: colors.muted,
    },
    segTextOn: {
      color: colors.text,
    },
    activityHint: {
      marginBottom: vs(8),
      marginLeft: ms(4),
    },
    primaryCta: {
      backgroundColor: colors.onboardingPush,
      borderRadius: 999,
      paddingVertical: vs(12),
      alignItems: 'center',
      marginBottom: vs(6),
    },
    primaryCtaText: {
      color: colors.tactileMomentumSecondary,
      fontSize: ms(15),
    },
    lanesLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(6),
      marginTop: vs(14),
      marginBottom: vs(8),
    },
    lanesLabel: {
      color: colors.onboardingInk,
    },
    inviteCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(6),
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.onboardingLine,
      borderRadius: 999,
      paddingVertical: vs(10),
      marginTop: vs(4),
      marginBottom: vs(20),
    },
    inviteCtaText: {
      color: colors.onboardingInk,
    },
    dissolvedNote: {
      textAlign: 'center',
      marginTop: vs(8),
      marginBottom: vs(20),
    },
  });
