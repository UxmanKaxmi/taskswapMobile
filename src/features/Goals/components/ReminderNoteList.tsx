import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useThemedStyles } from '@shared/theme';
import Avatar from '@shared/components/Avatar/Avatar';
import Ripple from '@shared/components/Buttons/Ripple';
import { ms, vs } from 'react-native-size-matters';
import { ReminderNoteDTO } from '@features/Home/types/home';

type Props = {
  reminders?: ReminderNoteDTO[];
  isLoading?: boolean;
  isError?: boolean;
  onPressFriendProfile: (friendId: string) => void;
  onPressRemainingLink?: () => void;

  /** If true, show all reminder notes. Otherwise show only first 2. */
  viewAll?: boolean;
};

function formatTimelineTime(dateISO: string) {
  const d = new Date(dateISO);
  const now = new Date();

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const dayLabel = isSameDay
    ? 'TODAY'
    : d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();

  const timeLabel = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dayLabel}, ${timeLabel}`.toUpperCase();
}

function renderSenderLabel(reminder: ReminderNoteDTO) {
  if (reminder.isSenderCurrentUser) return 'You';
  const senderName = reminder.senderName?.trim();

  return senderName ? senderName : 'Someone';
}

export default function ReminderNoteList({
  reminders = [],
  isLoading = false,
  isError = false,
  onPressFriendProfile,
  onPressRemainingLink,
  viewAll = false,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const extraAnim = useRef(new Animated.Value(viewAll ? 1 : 0)).current;
  const [renderExtra, setRenderExtra] = useState(viewAll);
  const [extraHeight, setExtraHeight] = useState(0);

  const remindersForUI = useMemo(() => {
    const base = reminders;
    // TESTING-ONLY MOCK FILL (disabled):
    // if (base.length >= 5) return base;
    //
    // const filled = [...base];
    // while (filled.length < 5 && base.length > 0) {
    //   const source = base[filled.length % base.length];
    //   filled.push({
    //     ...source,
    //     id: `${source.id}-mock-${filled.length}`,
    //     createdAt: new Date(
    //       new Date(source.createdAt).getTime() - filled.length * 60_000,
    //     ).toISOString(),
    //     message: `${source.message} (test ${filled.length + 1})`,
    //   });
    // }
    // return filled;

    return base;
  }, [reminders]);
  const totalRemindersForUI = remindersForUI.length;
  const firstReminder = remindersForUI[0];
  const extraReminders = remindersForUI.slice(1);
  const extraCount = extraReminders.length;
  const shouldShowRemainingLink = !viewAll && extraCount > 0;
  const showExtra = renderExtra && extraCount > 0;
  const needsMeasure = viewAll && extraHeight === 0 && extraCount > 0;

  useEffect(() => {
    if (viewAll) {
      setRenderExtra(true);
    }
  }, [viewAll]);

  useEffect(() => {
    if (viewAll) {
      if (extraHeight === 0) return;
      Animated.timing(extraAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }).start();
      return;
    }

    Animated.timing(extraAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setRenderExtra(false);
    });
  }, [viewAll, extraAnim, extraHeight]);

  if (isLoading)
    return (
      <TextElement variant="caption" color="muted">
        {/* Loading reminders... */}
      </TextElement>
    );

  if (isError)
    return (
      <TextElement variant="caption" color="error">
        Failed to load reminders.
      </TextElement>
    );

  if (!firstReminder)
    return (
      <TextElement variant="caption" color="muted">
        No reminders yet.
      </TextElement>
    );

  return (
    <Shadow size="tint" style={styles.card}>
      <View style={styles.timeline}>
        <View style={styles.rail} />

        <View style={[styles.itemRow, !showExtra && styles.lastRow]}>
          <View style={styles.dotWrap}>
            <View style={styles.dotHalo} />
            <View style={styles.dot} />
          </View>

          <View style={styles.content}>
            <View style={styles.topRow}>
              <TextElement style={styles.timeText}>
                {formatTimelineTime(firstReminder.createdAt)}
              </TextElement>
            </View>

            <View style={styles.senderRow}>
              <Ripple onPress={() => onPressFriendProfile(firstReminder.senderId)}>
                <Avatar
                  uri={firstReminder.senderPhoto ?? ''}
                  fallback={firstReminder.senderName?.[0] ?? '?'}
                  size={28}
                />
              </Ripple>

              <Ripple onPress={() => onPressFriendProfile(firstReminder.senderId)}>
                <TextElement style={styles.senderLine}>
                  <TextElement style={styles.senderNameStrong}>
                    {renderSenderLabel(firstReminder)}
                  </TextElement>{' '}
                  sent a reminder
                </TextElement>
              </Ripple>
            </View>

            <View style={styles.bubble}>
              <TextElement style={styles.bubbleText}>{firstReminder.message}</TextElement>
            </View>
          </View>
        </View>

        {needsMeasure && (
          <View
            pointerEvents="none"
            style={[styles.measureWrap, styles.extraWrap]}
            onLayout={event => {
              const height = event.nativeEvent.layout.height;
              if (height !== extraHeight) setExtraHeight(height);
            }}
          >
            {extraReminders.map((reminder, index) => {
              const isLast = index === extraReminders.length - 1;

              return (
                <View key={reminder.id} style={[styles.itemRow, isLast && styles.lastRow]}>
                  <View style={styles.dotWrap}>
                    <View style={styles.dotHalo} />
                    <View style={styles.dot} />
                  </View>

                  <View style={styles.content}>
                    <View style={styles.topRow}>
                      <TextElement style={styles.timeText}>
                        {formatTimelineTime(reminder.createdAt)}
                      </TextElement>
                    </View>

                    <View style={styles.senderRow}>
                      <Ripple onPress={() => onPressFriendProfile(reminder.senderId)}>
                        <Avatar
                          uri={reminder.senderPhoto ?? ''}
                          fallback={reminder.senderName?.[0] ?? '?'}
                          size={28}
                        />
                      </Ripple>

                      <Ripple onPress={() => onPressFriendProfile(reminder.senderId)}>
                        <TextElement style={styles.senderLine}>
                          <TextElement style={styles.senderNameStrong}>
                            {renderSenderLabel(reminder)}
                          </TextElement>{' '}
                          sent a reminder
                        </TextElement>
                      </Ripple>
                    </View>

                    <View style={styles.bubble}>
                      <TextElement style={styles.bubbleText}>{reminder.message}</TextElement>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {showExtra && (
          <Animated.View
            style={[
              styles.remainingWrap,
              styles.extraWrap,
              {
                height: extraAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, extraHeight],
                }),
                opacity: extraAnim,
                overflow: 'hidden',
              },
            ]}
          >
            {extraReminders.map((reminder, index) => {
              const isLast = index === extraReminders.length - 1;

              return (
                <View key={reminder.id} style={[styles.itemRow, isLast && styles.lastRow]}>
                  <View style={styles.dotWrap}>
                    <View style={styles.dotHalo} />
                    <View style={styles.dot} />
                  </View>

                  <View style={styles.content}>
                    <View style={styles.topRow}>
                      <TextElement style={styles.timeText}>
                        {formatTimelineTime(reminder.createdAt)}
                      </TextElement>
                    </View>

                    <View style={styles.senderRow}>
                      <Ripple onPress={() => onPressFriendProfile(reminder.senderId)}>
                        <Avatar
                          uri={reminder.senderPhoto ?? ''}
                          fallback={reminder.senderName?.[0] ?? '?'}
                          size={28}
                        />
                      </Ripple>

                      <Ripple
                        style={{ minHeight: 30 }}
                        onPress={() => onPressFriendProfile(reminder.senderId)}
                      >
                        <TextElement style={styles.senderLine}>
                          <TextElement style={styles.senderNameStrong}>
                            {renderSenderLabel(reminder)}{' '}
                          </TextElement>
                          sent a reminder
                        </TextElement>
                      </Ripple>
                    </View>

                    <View style={styles.bubble}>
                      <TextElement style={styles.bubbleText}>{reminder.message}</TextElement>
                    </View>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}

        <View style={styles.endDotWrap}>
          <View style={styles.dotHalo} />
          <View style={styles.dot} />
        </View>
      </View>

      {shouldShowRemainingLink && (
        <Ripple onPress={onPressRemainingLink} style={styles.remainingLinkWrap}>
          <TextElement style={styles.remainingLinkText}>
            {`and ${extraCount} ${extraCount === 1 ? 'other' : 'others'} sent you a reminder`}
          </TextElement>
        </Ripple>
      )}
    </Shadow>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.onPrimary,
      borderRadius: 28,
      paddingTop: vs(16),
      paddingBottom: vs(22),
      paddingHorizontal: ms(12),
    },

    timeline: {
      position: 'relative',
      paddingLeft: vs(22),
    },
    rail: {
      position: 'absolute',
      left: vs(10),
      top: 0,
      bottom: 0,
      width: 2,
      borderRadius: 1,
      backgroundColor: colors.reminderBgHard,
    },

    itemRow: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    lastRow: {
      marginBottom: 0,
    },
    remainingWrap: {
      overflow: 'visible',
    },
    measureWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      opacity: 0,
    },
    extraWrap: {
      marginLeft: vs(-23),
      paddingLeft: vs(23),
    },

    dotWrap: {
      width: ms(30),
      height: ms(40),
      marginTop: vs(-7),
      marginLeft: vs(-23),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onPrimary,
    },
    endDotWrap: {
      width: ms(30),
      height: ms(40),
      marginLeft: vs(-23),
      marginBottom: vs(-10),

      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onPrimary,
    },

    dotHalo: {
      position: 'absolute',
      width: ms(18),
      height: ms(18),
      borderRadius: ms(9),
      backgroundColor: colors.reminderBgHard,
      opacity: 0.6,
    },

    dot: {
      width: ms(12),
      height: ms(12),
      borderRadius: ms(6),
      backgroundColor: colors.reminderBgHardest,
    },

    content: {
      flex: 1,
      paddingLeft: ms(10),
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    timeText: {
      fontSize: ms(10),
      color: colors.placeHolder,
      fontWeight: '600',
      letterSpacing: 0.6,
    },

    senderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: vs(7),
      marginTop: vs(15),
    },
    senderLine: {
      flex: 1,
      fontSize: ms(13),
      color: colors.muted,
    },
    senderNameStrong: {
      fontSize: ms(13),
      fontWeight: '500',
      color: colors.text,
    },

    bubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.reminderIconBackground,
      borderRadius: 20,
      paddingVertical: vs(10),
      paddingHorizontal: spacing.md,
      maxWidth: '92%',
    },
    bubbleText: {
      fontSize: ms(14),
      color: colors.text,
      lineHeight: ms(20),
    },
    remainingLinkWrap: {
      marginTop: vs(7),
      marginBottom: vs(-9),
      alignSelf: 'flex-start',
      marginLeft: vs(10),
      borderRadius: 999,
    },
    remainingLinkText: {
      fontSize: ms(12),
      color: colors.reminderBgHardest,
      fontWeight: '500',
      // textDecorationLine: 'underline',
    },
  });
