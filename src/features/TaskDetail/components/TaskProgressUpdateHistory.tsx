import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import Ripple from '@shared/components/Buttons/Ripple';
import TextElement from '@shared/components/TextElement/TextElement';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { colors, spacing } from '@shared/theme';
import { getFirstName, stripOuterQuotes } from '@shared/utils/helperFunctions';
import type { ProgressUpdate } from '@features/Tasks/types/tasks';

type Props = {
  updates?: ProgressUpdate[];
  ownerName: string;
  ownerAvatar?: string;
  isOwner?: boolean;
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

export default function TaskProgressUpdateHistory({ updates = [], ownerName, isOwner }: Props) {
  const [expanded, setExpanded] = useState(false);
  const extraAnim = useRef(new Animated.Value(0)).current;
  const [renderExtra, setRenderExtra] = useState(false);
  const [extraHeight, setExtraHeight] = useState(0);

  const updatesForUI = useMemo(() => updates, [updates]);
  const firstUpdate = updatesForUI[0];
  const extraUpdates = updatesForUI.slice(1);
  const extraCount = extraUpdates.length;
  const showExtra = renderExtra && extraCount > 0;
  const needsMeasure = expanded && extraHeight === 0 && extraCount > 0;
  const firstName = getFirstName(ownerName);

  useEffect(() => {
    if (expanded) {
      setRenderExtra(true);
    }
  }, [expanded]);

  useEffect(() => {
    if (expanded) {
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
  }, [expanded, extraAnim, extraHeight]);

  if (!firstUpdate) return null;

  return (
    <Shadow size="tint" style={styles.card}>
      <View style={styles.timeline}>
        <View style={styles.rail} />

        <ProgressUpdateRow
          update={firstUpdate}
          ownerFirstName={firstName}
          isLast={!showExtra}
          isOwner={isOwner}
        />

        {needsMeasure && (
          <View
            pointerEvents="none"
            style={[styles.measureWrap, styles.extraWrap]}
            onLayout={event => {
              const height = event.nativeEvent.layout.height;
              if (height !== extraHeight) setExtraHeight(height);
            }}
          >
            {extraUpdates.map((update, index) => (
              <ProgressUpdateRow
                key={`${update.createdAt}-${index}`}
                update={update}
                ownerFirstName={firstName}
                isLast={index === extraUpdates.length - 1}
                isOwner={isOwner}
                isPrevious
              />
            ))}
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
            {extraUpdates.map((update, index) => (
              <ProgressUpdateRow
                key={`${update.createdAt}-${index}`}
                update={update}
                ownerFirstName={firstName}
                isLast={index === extraUpdates.length - 1}
                isOwner={isOwner}
                isPrevious
              />
            ))}
          </Animated.View>
        )}

        <View style={styles.endDotWrap}>
          <View style={styles.dotHalo} />
          <View style={styles.dot} />
        </View>
      </View>

      {extraCount > 0 && (
        <Ripple onPress={() => setExpanded(value => !value)} style={styles.remainingLinkWrap}>
          <TextElement style={styles.remainingLinkText}>
            {expanded
              ? 'Hide older updates'
              : `and ${extraCount} older progress ${extraCount === 1 ? 'update' : 'updates'}`}
          </TextElement>
        </Ripple>
      )}
    </Shadow>
  );
}

function ProgressUpdateRow({
  update,
  ownerFirstName,
  isLast,
  isOwner,
  isPrevious,
}: {
  update: ProgressUpdate;
  ownerFirstName: string;
  isLast: boolean;
  isOwner: boolean | undefined;
  isPrevious?: boolean;
}) {
  return (
    <View style={[styles.itemRow, isLast && styles.lastRow]}>
      <View style={styles.dotWrap}>
        <View style={styles.dotHalo} />
        <View style={styles.dot} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <TextElement style={styles.timeText}>{formatTimelineTime(update.createdAt)}</TextElement>
        </View>
        <View style={styles.senderRow}>
          {isOwner && isPrevious ? (
            <TextElement style={styles.senderLine}>
              You made a progress update previously
            </TextElement>
          ) : isOwner ? (
            <TextElement style={styles.senderLine}>You shared an update.</TextElement>
          ) : (
            <TextElement style={styles.senderLine}>
              <TextElement style={styles.senderNameStrong}>{ownerFirstName}</TextElement> has made a
              progress update.
            </TextElement>
          )}
        </View>

        <View style={styles.bubble}>
          <TextElement style={styles.bubbleText}>{stripOuterQuotes(update.text)}</TextElement>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.onPrimary,
    borderRadius: 28,
    paddingTop: vs(14),
    paddingBottom: vs(14),
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
    backgroundColor: colors.motivationBgHard,
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
    backgroundColor: colors.motivationBgHard,
    opacity: 0.6,
  },
  dot: {
    width: ms(12),
    height: ms(12),
    borderRadius: ms(6),
    backgroundColor: colors.motivationBgHardest,
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
    marginBottom: vs(5),
    marginTop: vs(5),
  },
  senderLine: {
    flex: 1,
    fontSize: ms(10),
    color: colors.muted,
  },
  senderNameStrong: {
    fontSize: ms(11),
    fontWeight: '500',
    color: colors.text,
  },
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.motivationIconBackground,
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
    color: colors.motivationBgHardest,
    fontWeight: '500',
  },
});
