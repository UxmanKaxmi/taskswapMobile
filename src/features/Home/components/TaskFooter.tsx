import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { colors } from '@shared/theme';
import Ripple from '@shared/components/Buttons/Ripple';
import { formatViews, getFirstName, toShortName } from '@shared/utils/helperFunctions';
import PushButton from '@shared/components/PushButton';
import { TaskType } from '../types/home';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { ms, vs } from 'react-native-size-matters';
import { isDEV } from '@shared/utils/constants';
import { usePushInteraction } from '../hooks/usePushInteraction';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import { useIsOwner } from '@features/Auth/AuthProvider';
import Row from '@shared/components/Layout/Row';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';

interface ExtraMeta {
  icon: string;
  count: number;
}

interface Props {
  commentCount?: number;
  shareHandler?: () => void;
  viewCount?: number;
  extra?: ExtraMeta;
  onPressComments?: () => void;
  taskDetails?: any;
  hasPushed?: boolean;
  pushCount?: number;
  onPressPush?: () => void;
  isPushing?: boolean;
  onPressUnpush?: () => void; //TEST ONLY

  //Reminder
  onSendReminder?: () => void;
  reminderText?: string;
  hasReminded?: boolean;
  reminderNoteCount?: number;
  reminderExpired?: boolean;
}

export default function TaskFooter({
  commentCount = 0,
  shareHandler,
  viewCount,
  extra,
  onPressComments,
  taskDetails,
  hasPushed = false,
  pushCount = 0,
  onPressPush,
  onPressUnpush,
  isPushing = false,

  //reminder
  onSendReminder,
  hasReminded,
  reminderNoteCount = 0,
  reminderText,
  reminderExpired,
}: Props) {
  const isCompleted = Boolean(taskDetails?.completed || taskDetails?.completedAt);
  const {
    hasPushed: pushed,
    pushedText,
    handlePush,
    handleUnpush,
  } = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: onPressPush ?? (() => {}),
    onUnpush: onPressUnpush,
    isPushing,
  });

  const isOwner = useIsOwner(taskDetails?.userId);

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const hasMounted = useRef(false);
  const { emoji } = getTypeVisual(taskDetails?.type);
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const ownerMotivationPushCount =
    isOwner && taskDetails?.type === TaskTypeEnum.Motivation
      ? Math.max(pushCount - (hasPushed ? 1 : 0), 0)
      : pushCount;
  const ownerMotivationText =
    ownerMotivationPushCount === 0
      ? 'No pushes yet'
      : ownerMotivationPushCount === 1
        ? '1 friend pushed you'
        : `${ownerMotivationPushCount} friends pushed you`;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    opacity.value = withTiming(0, { duration: 80 }, () => {
      translateY.value = pushed ? 2 : 0;
      opacity.value = withTiming(1, { duration: 150 });
    });
  }, [pushed]);

  return (
    <View>
      <AppBorder
        color={colors[`${taskDetails?.type}BgHard` as keyof typeof colors]}
        style={{ marginBottom: vs(14) }}
        thickness={0.5}
      />
      <View style={styles.footer}>
        {isCompleted ? (
          <View style={styles.completedRow}>
            <Icon
              set="fa6"
              name="circle-check"
              iconStyle="solid"
              size={ms(12)}
              color={colors.motivationBgHardest}
            />
            <TextElement style={styles.completedLine}>Completed</TextElement>
          </View>
        ) : taskDetails?.type === TaskTypeEnum.Motivation ? (
          <Animated.View style={[animatedStyle, { flex: 1 }]}>
            {isOwner ? (
              <TextElement style={styles.pushedText}>{ownerMotivationText}</TextElement>
            ) : (
              <View style={styles.pushActionRow}>
                <TextElement style={styles.pushedText}>{pushedText}</TextElement>

                <View style={styles.pushButtonColumn}>
                  <PushButton
                    onPress={handlePush}
                    loading={isPushing}
                    taskType={TaskTypeEnum.Motivation}
                    label={emoji + `Push ${getFirstName(taskDetails?.name)}!`}
                    activeLabel="Pushed"
                    active={pushed}
                    variant="push"
                    size="sm"
                  />

                  {isDEV && pushed && (
                    <TouchableOpacity onPress={handleUnpush} style={styles.unpushButton}>
                      <TextElement style={styles.unpushText}>Unpush (dev)</TextElement>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        ) : taskDetails?.type === TaskTypeEnum.Advice ? (
          <View style={{ flex: 1, alignItems: 'center' }}>
            {/* OWNER */}
            {isOwner ? (
              commentCount > 0 ? (
                <TextElement style={styles.pushedText}>
                  {commentCount === 1
                    ? '1 person shared advice'
                    : `${commentCount} people shared advice`}
                </TextElement>
              ) : (
                <TextElement style={styles.pushedText}>Waiting for advice</TextElement>
              )
            ) : /* NON-OWNER */ taskDetails.hasAdvised ? (
              <TextElement style={styles.pushedText}>
                {commentCount > 1
                  ? `You and ${commentCount - 1} others shared advice`
                  : 'You shared advice'}
              </TextElement>
            ) : (
              <View
                style={{
                  width: '100%',
                  flex: 1,
                }}
              >
                <PushButton
                  onPress={() => {
                    if (!taskDetails) return;
                    checkAuthThenNavigate(
                      'TaskDetail',
                      {
                        task: {
                          ...taskDetails,
                          openAdviceComposer: true,
                        },
                      },
                      {
                        authContext: 'Advice',
                      },
                    );
                  }}
                  taskType={TaskTypeEnum.Advice}
                  label={`${emoji} Suggest advice`}
                  size="sm"
                  buttonStyle={{ paddingLeft: ms(8) }}
                />
              </View>
            )}
          </View>
        ) : taskDetails?.type === TaskTypeEnum.Reminder ? (
          <View style={{ flex: 1 }}>
            {/* OWNER */}
            {isOwner ? (
              <Row justify="space-between" align="center" style={{ width: '100%' }}>
                <TextElement style={styles.pushedText}>
                  {taskDetails.hasReminded
                    ? 'Reminder sent'
                    : reminderNoteCount === 0
                      ? 'No reminders yet'
                      : reminderNoteCount === 1
                        ? '1 person reminded you'
                        : `${reminderNoteCount} people reminded you`}
                </TextElement>

                {reminderText &&
                  (() => {
                    const [timeEmoji, ...timeText] = reminderText.split(' ');

                    return (
                      <Row align="center">
                        <TextElement style={styles.reminderEmoji}>{timeEmoji}</TextElement>

                        <TextElement style={styles.reminderSubText}>
                          {timeText.join(' ')}
                        </TextElement>
                      </Row>
                    );
                  })()}
              </Row>
            ) : taskDetails.hasReminded ? (
              /* NON-OWNER — already nudged */
              <Row justify="space-between" align="center" style={{ width: '100%' }}>
                <TextElement style={styles.pushedText}>
                  You reminded {getFirstName(taskDetails?.name)}
                </TextElement>

                {reminderText &&
                  (() => {
                    const [timeEmoji, ...timeText] = reminderText.split(' ');

                    return (
                      <Row align="center">
                        <TextElement style={styles.reminderEmoji}>{timeEmoji}</TextElement>

                        <TextElement style={styles.reminderSubText}>
                          {timeText.join(' ')}
                        </TextElement>
                      </Row>
                    );
                  })()}
              </Row>
            ) : (
              /* NON-OWNER — can nudge */
              <Row justify="space-between" align="center" style={{ width: '100%' }}>
                <PushButton
                  onPress={() => {
                    if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Reminder' }))
                      return;

                    onSendReminder?.();
                  }}
                  taskType={TaskTypeEnum.Reminder}
                  label={emoji + ' Send reminder'}
                  size="sm"
                />

                {reminderText &&
                  (() => {
                    const [timeEmoji, ...timeText] = reminderText.split(' ');

                    return (
                      <Row align="center">
                        <TextElement style={styles.reminderEmoji}>{timeEmoji}</TextElement>

                        <TextElement style={styles.reminderSubText}>
                          {timeText.join(' ')}
                        </TextElement>
                      </Row>
                    );
                  })()}
              </Row>
            )}
          </View>
        ) : taskDetails?.type === TaskTypeEnum.Decision ? (
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            {(() => {
              const voteCount = taskDetails.voteCount ?? 0;
              const hasVoted = taskDetails.hasVoted;
              const ownerName = getFirstName(taskDetails?.name);

              // 🟣 CASE 1: No votes yet
              if (voteCount === 0) {
                return (
                  <TextElement style={styles.pushedText}>
                    {isOwner ? 'Be the first to vote' : `Your opinion can help ${ownerName} decide`}
                  </TextElement>
                );
              }

              // 🟣 CASE 2: User HAS voted
              if (hasVoted) {
                return (
                  <TextElement style={styles.pushedText}>
                    {voteCount === 1
                      ? 'Your vote is in'
                      : `You and ${voteCount - 1} other${
                          voteCount - 1 === 1 ? '' : 's'
                        } voted their picks`}
                  </TextElement>
                );
              }

              // 🟣 CASE 3: User has NOT voted, others have
              return (
                <TextElement style={styles.pushedText}>
                  {isOwner ? 'Be the first to vote' : `Your opinion can help ${ownerName} decide`}
                </TextElement>
              );
            })()}
          </View>
        ) : null}

        {/* View Count */}
        {/* {typeof viewCount === 'number' && (
          <View style={[styles.action]}>
            <Icon name="eye-outline" size={16} color={colors.muted} set="ion" />
            <TextElement style={styles.count}>{formatViews(viewCount)}</TextElement>
          </View>
        )} */}

        {/* Comments */}
        {/* {
          <Ripple style={styles.action} onPress={onPressComments}>
            <Icon set="fa6" name="comment" size={ms(14)} color={colors.muted} />
            <TextElement style={styles.count}>{commentCount}</TextElement>
          </Ripple>
        } */}

        {/* Share */}
        {/* {shareHandler && (
          <Ripple style={styles.action} onPress={shareHandler}>
            <Icon set="ion" name="share-outline" size={ms(12)} color={colors.muted} />
            {/* <TextElement style={styles.count}>Share</TextElement> */}
        {/* </Ripple> */}
        {/* )} */}

        {/* Extra (votes/helpers/etc) */}
        {/*
{extra?.icon && (
  <View style={styles.action}>
    <Icon name={extra.icon} size={18} variant="text" />
    <TextElement style={styles.count}>{extra.count}</TextElement>
  </View>
)}
*/}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reminderSubText: {
    fontSize: ms(12),
    color: colors.muted,
    opacity: 0.6,
    textAlign: 'center',
  },
  pushActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    flex: 1,
  },
  pushButtonColumn: {
    alignItems: 'flex-end',
  },
  unpushButton: {
    marginTop: vs(6),
  },

  unpushText: {
    fontSize: ms(11),
    color: colors.error,
    opacity: 0.6,
  },
  pushedText: {
    // marginTop: vs(6),
    fontSize: ms(12),
    color: colors.muted,
    opacity: 0.6,
    // backgroundColor: 'red',
  },
  footer: {
    gap: 20,
    flexDirection: 'row',
    // paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  count: {
    marginLeft: 6,
    color: colors.muted,
    fontSize: ms(14),
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  completedLine: {
    fontSize: ms(11),
    lineHeight: ms(14),
    color: colors.muted,
    fontWeight: '400',
    flexShrink: 1,
  },
  adviceCount: {
    color: colors.adviceBgHardest,
    fontSize: ms(12),
    fontWeight: '600',
  },
  adviceCountText: {
    // marginLeft: 6,
    color: colors.adviceBgHardest,
    fontSize: ms(12),
    fontWeight: '500',
  },
  reminderEmoji: {
    fontSize: ms(10),
    opacity: 0.7,
  },
});
