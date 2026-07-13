import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useThemedStyles } from '@shared/theme';
import { getFirstName, timeAgo } from '@shared/utils/helperFunctions';
import type { CircleActivityEvent } from '../types/circles.types';

type Props = {
  events: CircleActivityEvent[];
  viewerUserId?: string;
  // Opens the same cheer sheet as the goal detail for a cheerable event.
  onPressCheer?: (event: CircleActivityEvent) => void;
};

// Event-type icon bubbles (prototype v3): the event kind carries the visual,
// not the member avatar.
const EVENT_ICONS: Record<CircleActivityEvent['kind'], string> = {
  created: '🎉',
  joined: '🎉',
  update: '✎',
  push: '⚡',
  done: '🏆',
  complete: '🏆',
};

function startOfToday() {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

// The row's cheer strip: your events show who cheered them, other members'
// cheerable events offer the cheer chip (or its Cheered ✓ receipt).
function CheerStrip({
  event,
  isViewerEvent,
  onPressCheer,
}: {
  event: CircleActivityEvent;
  isViewerEvent: boolean;
  onPressCheer?: (event: CircleActivityEvent) => void;
}) {
  const styles = useThemedStyles(createStyles);

  if (!event.beatId) return null;

  if (isViewerEvent) {
    if (!event.cheerCount) return null;
    const label = event.latestCheer
      ? `${getFirstName(event.latestCheer.name)} cheered · "${event.latestCheer.text}"`
      : `${event.cheerCount} ${event.cheerCount === 1 ? 'cheer' : 'cheers'}`;
    return (
      <View style={styles.cheerPill}>
        <TextElement variant="caption" weight="700" style={styles.cheerPillText} numberOfLines={1}>
          🎉 {label}
        </TextElement>
      </View>
    );
  }

  if (event.viewerHasCheered) {
    return (
      <View style={styles.cheerPill}>
        <TextElement variant="caption" weight="700" style={styles.cheerPillText}>
          🎉 Cheered ✓
        </TextElement>
      </View>
    );
  }

  if (!onPressCheer) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.cheerPill, pressed && styles.cheerPillPressed]}
      onPress={() => onPressCheer(event)}
      accessibilityRole="button"
      accessibilityLabel={`Cheer ${getFirstName(event.name)} on`}
    >
      <TextElement variant="caption" weight="700" style={styles.cheerPillText}>
        🎉 {event.kind === 'done' ? `Cheer ${getFirstName(event.name)} on` : 'Cheer'}
      </TextElement>
    </Pressable>
  );
}

type RowProps = {
  event: CircleActivityEvent;
  isLast: boolean;
  viewerUserId?: string;
  onPressCheer?: (event: CircleActivityEvent) => void;
};

function TimelineRow({ event, isLast, viewerUserId, onPressCheer }: RowProps) {
  const styles = useThemedStyles(createStyles);

  const isViewerEvent = Boolean(viewerUserId) && event.userId === viewerUserId;
  const actorName = isViewerEvent ? 'You' : getFirstName(event.name);

  const bubbleStyle =
    event.kind === 'update'
      ? styles.bubbleUpdate
      : event.kind === 'created' || event.kind === 'joined'
        ? styles.bubbleJoin
        : styles.bubblePush;

  return (
    <View style={styles.row}>
      <View style={styles.bubbleColumn}>
        <View style={[styles.bubble, bubbleStyle]}>
          <TextElement style={styles.bubbleIcon}>{EVENT_ICONS[event.kind]}</TextElement>
        </View>
        {!isLast ? <View style={styles.connector} /> : null}
      </View>
      <View style={styles.body}>
        <TextElement variant="bodySmall" style={styles.line}>
          <TextElement variant="bodySmall" weight="700" style={styles.line}>
            {actorName}
          </TextElement>
          {event.kind === 'push' ? (
            <>
              {' pushed '}
              <TextElement variant="bodySmall" weight="700" style={styles.line}>
                {getFirstName(event.targetName ?? 'a member')}
              </TextElement>
              {' forward'}
            </>
          ) : event.kind === 'created' ? (
            ' started the circle'
          ) : event.kind === 'joined' ? (
            ' joined the circle'
          ) : event.kind === 'update' ? (
            ' shared an update'
          ) : event.kind === 'done' ? (
            ' completed it'
          ) : (
            ' did it. All of you.'
          )}
        </TextElement>
        <TextElement variant="caption" color="muted" style={styles.when}>
          {timeAgo(event.at)}
        </TextElement>
        {event.text ? (
          <View style={styles.quote}>
            <TextElement variant="bodySmall" weight="600" style={styles.quoteText}>
              {event.text}
            </TextElement>
          </View>
        ) : null}
        <CheerStrip event={event} isViewerEvent={isViewerEvent} onPressCheer={onPressCheer} />
      </View>
    </View>
  );
}

// The circle's shared timeline, grouped TODAY / EARLIER. Positive events
// only — quiet stays quiet.
export default function CircleActivityTimeline({ events, viewerUserId, onPressCheer }: Props) {
  const styles = useThemedStyles(createStyles);

  if (events.length === 0) {
    return (
      <TextElement variant="body" color="muted" style={styles.empty}>
        Nothing here yet. The first update starts the story.
      </TextElement>
    );
  }

  const todayStart = startOfToday();
  const todayEvents = events.filter(event => Date.parse(event.at) >= todayStart);
  const earlierEvents = events.filter(event => Date.parse(event.at) < todayStart);

  return (
    <View style={styles.card}>
      {todayEvents.length > 0 ? (
        <>
          <TextElement variant="caption" weight="800" style={styles.groupLabel}>
            TODAY
          </TextElement>
          {todayEvents.map((event, index) => (
            <TimelineRow
              key={event.id}
              event={event}
              isLast={index === todayEvents.length - 1}
              viewerUserId={viewerUserId}
              onPressCheer={onPressCheer}
            />
          ))}
        </>
      ) : null}

      {earlierEvents.length > 0 ? (
        <>
          <TextElement
            variant="caption"
            weight="800"
            style={[styles.groupLabel, todayEvents.length > 0 && styles.groupLabelSpaced]}
          >
            EARLIER
          </TextElement>
          {earlierEvents.map((event, index) => (
            <TimelineRow
              key={event.id}
              event={event}
              isLast={index === earlierEvents.length - 1}
              viewerUserId={viewerUserId}
              onPressCheer={onPressCheer}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 22,
      paddingVertical: vs(14),
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    empty: {
      textAlign: 'center',
      marginVertical: vs(24),
    },
    groupLabel: {
      fontSize: ms(9.5),
      letterSpacing: 1.4,
      color: colors.muted,
      marginBottom: vs(10),
    },
    groupLabelSpaced: {
      marginTop: vs(14),
    },
    row: {
      flexDirection: 'row',
      gap: ms(11),
      paddingBottom: vs(14),
    },
    bubbleColumn: {
      alignItems: 'center',
    },
    bubble: {
      width: ms(32),
      height: ms(32),
      borderRadius: ms(16),
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubblePush: {
      backgroundColor: colors.reminderBg,
    },
    bubbleUpdate: {
      backgroundColor: colors.onboardingDoneSoft,
    },
    bubbleJoin: {
      backgroundColor: colors.circleAccentSoft,
    },
    bubbleIcon: {
      fontSize: ms(14),
      lineHeight: ms(18),
    },
    connector: {
      flex: 1,
      width: 2,
      backgroundColor: colors.onboardingLine,
      marginTop: vs(4),
    },
    body: {
      flex: 1,
      paddingTop: vs(3),
    },
    line: {
      fontSize: ms(13.5),
      lineHeight: ms(19),
      color: colors.text,
    },
    when: {
      marginTop: vs(1),
      fontSize: ms(11),
    },
    quote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.onboardingDone,
      backgroundColor: colors.onboardingDoneSoft,
      borderRadius: 8,
      paddingVertical: vs(6),
      paddingHorizontal: ms(10),
      marginTop: vs(6),
    },
    quoteText: {
      fontSize: ms(13),
      color: colors.text,
    },
    cheerPill: {
      alignSelf: 'flex-start',
      maxWidth: '100%',
      backgroundColor: colors.circleAccentSoft,
      borderRadius: 999,
      paddingVertical: vs(5),
      paddingHorizontal: ms(12),
      marginTop: vs(7),
    },
    cheerPillPressed: {
      opacity: 0.7,
    },
    cheerPillText: {
      fontSize: ms(12),
      color: colors.circleAccent,
    },
  });
