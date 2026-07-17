import React, { useCallback, useMemo, useState } from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import Avatar from '@shared/components/Avatar/Avatar';
import Icon from '@shared/components/Icons/Icon';
import { platformShadow, spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { useAuth } from '@features/Auth/AuthProvider';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { getFeelingLabel } from '@shared/utils/feelings';
import { getFirstName, toShortName } from '@shared/utils/helperFunctions';
import { showPushToast } from '@shared/utils/toast';
import PushTicks from '@shared/components/PushTicks/PushTicks';
import PushButton from '@shared/components/PushButton';
import { useModal } from '@shared/components/ModalProvider';
import CircleAvatarStack from './CircleAvatarStack';
import { usePushAllCircle } from '../hooks/useCircles';
import { getCircleDayNumber } from '../utils/circleDay';
import type { CircleCardMember, CircleFeedCard } from '../types/circles.types';

type Props = {
  card: CircleFeedCard;
  onPress: (card: CircleFeedCard) => void;
};

// A viewer-readable roster status, not a wall of identical day counts:
// done ✓ > shared (has an update) > mood > day count.
function chipStatus(member: CircleCardMember): string {
  if (member.state === 'done') return 'Done';
  if (member.hasUpdate) return 'Shared';
  if (member.feeling) return getFeelingLabel(member.feeling);
  return `Day ${getCircleDayNumber(member.taskCreatedAt)}`;
}

function getMemberDisplayNames(members: CircleCardMember[]): string[] {
  const firstNameCounts = new Map<string, number>();
  members.forEach(member => {
    const firstName = getFirstName(member.name) || 'Member';
    const key = firstName.toLowerCase();
    firstNameCounts.set(key, (firstNameCounts.get(key) ?? 0) + 1);
  });

  const used = new Set<string>();

  return members.map((member, index) => {
    const firstName = getFirstName(member.name) || `Member ${index + 1}`;
    const firstKey = firstName.toLowerCase();
    const needsDisambiguation = (firstNameCounts.get(firstKey) ?? 0) > 1;
    const preferred = needsDisambiguation ? toShortName(member.name) || firstName : firstName;
    const preferredKey = preferred.toLowerCase();

    if (!used.has(preferredKey)) {
      used.add(preferredKey);
      return preferred;
    }

    const fallback = `Member ${index + 1}`;
    used.add(fallback.toLowerCase());
    return fallback;
  });
}

function getUpdatePillCopy(card: CircleFeedCard, memberNames: string[]): string {
  if (card.recentUpdateCount <= 0) return '';

  const updateMemberIndex = card.members.findIndex(member => member.hasUpdate);
  if (card.recentUpdateCount === 1 && updateMemberIndex >= 0) {
    return `New update from ${memberNames[updateMemberIndex]}`;
  }

  return `${card.recentUpdateCount} recent ${card.recentUpdateCount === 1 ? 'update' : 'updates'}`;
}

// The feed's ONE card per circle: stacked avatars, the shared sentence,
// an activity signal, and a way to back the whole circle without opening
// it. Positive events only.
export default function CircleCard({ card, onPress }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { user } = useAuth();
  const { openCircleMembersSheet } = useModal();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const pushAll = usePushAllCircle(card.id, user?.id);
  const memberNames = useMemo(() => getMemberDisplayNames(card.members), [card.members]);
  const viewerIsCircleMember = useMemo(
    () => card.members.some(member => member.userId === user?.id),
    [card.members, user?.id],
  );
  const memberRows = useMemo(
    () =>
      card.members.map((member, index) => ({
        userId: member.userId,
        name: member.name,
        avatar: member.avatar,
        displayName: memberNames[index],
        status: chipStatus(member),
      })),
    [card.members, memberNames],
  );
  // Feed cards don't carry per-viewer push state; remember a successful
  // fan-out locally so the button reads "Pushed ✓" until the next refetch.
  const [pushedAll, setPushedAll] = useState(false);

  const onPressPushAll = useCallback(() => {
    if (!checkAuthThenNavigate()) return;
    if (pushedAll || pushAll.isPending) return;
    pushAll.mutate(undefined, {
      onSuccess: result => {
        setPushedAll(true);
        if (result.pushed.length > 0) {
          showPushToast({
            pusherName: 'You',
            message: viewerIsCircleMember
              ? 'just pushed the others forward'
              : 'just pushed everyone forward',
          });
        }
      },
    });
  }, [checkAuthThenNavigate, pushAll, pushedAll, viewerIsCircleMember]);

  const onPressRoster = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      openCircleMembersSheet({ members: memberRows, currentUserId: user?.id });
    },
    [memberRows, openCircleMembersSheet, user?.id],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(card)}
      accessibilityRole="button"
      accessibilityLabel={`Open circle: ${card.goalText}`}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={({ pressed }) => [styles.identityRow, pressed && styles.inlinePressed]}
          onPress={onPressRoster}
          accessibilityRole="button"
          accessibilityLabel="Show everyone in this circle"
        >
          <View style={styles.avatarRing}>
            <CircleAvatarStack members={card.members} size={30} maxVisible={4} />
          </View>
        </Pressable>

        <View style={styles.headerRight}>
          <View style={styles.circleTag}>
            <Icon
              set="fa6"
              name="circle-dot"
              iconStyle="solid"
              size={ms(10)}
              color={colors.circleAccent}
            />
            <TextElement variant="caption" weight="800" style={styles.circleTagText}>
              CIRCLE · DAY {getCircleDayNumber(card.createdAt)}
            </TextElement>
          </View>
        </View>
      </View>

      <TextElement style={styles.sentence}>{card.goalText}</TextElement>

      <View style={styles.chipsRow}>
        {card.members.slice(0, 3).map((member, index) => (
          <Pressable
            key={member.userId}
            style={({ pressed }) => [styles.memberChip, pressed && styles.memberChipPressed]}
            onPress={onPressRoster}
            accessibilityRole="button"
            accessibilityLabel={`Show everyone in this circle, including ${member.name}`}
          >
            <Avatar uri={member.avatar || undefined} fallback={member.name?.[0] ?? '?'} size={18} />
            <TextElement variant="caption" weight="600" style={styles.memberChipText}>
              {memberNames[index]}{' '}
              <TextElement variant="caption" style={styles.memberChipStatus}>
                · {chipStatus(member)}
              </TextElement>
            </TextElement>
          </Pressable>
        ))}
        {card.members.length > 3 ? (
          <Pressable
            style={({ pressed }) => [styles.memberChip, pressed && styles.memberChipPressed]}
            onPress={onPressRoster}
            accessibilityRole="button"
            accessibilityLabel="Show every member of this circle"
          >
            <TextElement variant="caption" weight="700" style={styles.memberChipText}>
              +{card.members.length - 3} more
            </TextElement>
          </Pressable>
        ) : null}
      </View>

      {card.recentUpdateCount > 0 ? (
        <View style={styles.updatesPill}>
          <TextElement variant="caption" weight="800" style={styles.updatesPillText}>
            {getUpdatePillCopy(card, memberNames)}
          </TextElement>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          {card.totalPushes > 0 ? (
            <>
              <PushTicks
                count={card.totalPushes}
                animateNonce={card.totalPushes}
                replayOnNonceChange={false}
                style={styles.ticks}
              />
              <TextElement style={styles.countLine}>
                <TextElement style={styles.countStrong}>
                  {card.totalPushes} {card.totalPushes === 1 ? 'push' : 'pushes'}
                </TextElement>
                <TextElement style={styles.countMuted}> across the circle</TextElement>
              </TextElement>
            </>
          ) : (
            <TextElement style={styles.noPushes}>No pushes yet</TextElement>
          )}
        </View>

        {card.status === 'active' ? (
          <PushButton
            onPress={onPressPushAll}
            loading={pushAll.isPending}
            active={pushedAll}
            variant="push"
            label="Push"
            activeLabel="Pushed"
            size="sm"
            stopPropagation
            buttonStyle={styles.pushAllButton}
            textStyle={styles.pushAllText}
            accessibilityLabel="Push every member of this circle"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.onboardingCard,
      borderRadius: 28,
      paddingHorizontal: ms(20),
      paddingVertical: vs(18),
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      ...platformShadow({
        color: '#000',
        opacity: 0.08,
        radius: 14,
        offset: { width: 0, height: 8 },
      }),
    },
    cardPressed: {
      opacity: 0.92,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    identityRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      gap: spacing.sm,
      borderRadius: 18,
    },
    inlinePressed: {
      opacity: 0.65,
    },
    headerRight: {
      flexShrink: 0,
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
      paddingVertical: vs(5),
      paddingHorizontal: ms(11),
    },
    circleTagText: {
      fontSize: ms(9.5),
      letterSpacing: 1.1,
      color: colors.circleAccent,
    },
    sentence: {
      marginTop: spacing.sm,
      color: colors.onboardingInk,
      fontSize: ms(20),
      lineHeight: ms(24),
      fontWeight: '700',
      letterSpacing: 0,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: ms(6),
      marginTop: spacing.sm,
    },
    memberChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(5),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: vs(2.5),
      paddingLeft: ms(4),
      paddingRight: ms(9),
      backgroundColor: colors.onboardingPaper,
    },
    memberChipPressed: {
      opacity: 0.65,
    },
    memberChipText: {
      fontSize: ms(11),
      color: colors.text,
    },
    memberChipStatus: {
      fontSize: ms(11),
      color: colors.muted,
    },
    updatesPill: {
      alignSelf: 'flex-start',
      backgroundColor: colors.onboardingPaper,
      borderRadius: 999,
      paddingVertical: vs(3),
      paddingHorizontal: ms(9),
      marginTop: vs(10),
    },
    updatesPillText: {
      fontSize: ms(10.5),
      color: colors.primary,
    },
    pushAllButton: {
      minWidth: ms(90),
      paddingHorizontal: ms(14),
      paddingVertical: vs(8),
      justifyContent: 'center',
    },
    pushAllText: {
      fontSize: ms(14),
      lineHeight: ms(17),
      fontWeight: '800',
    },
    footerRow: {
      marginTop: spacing.md,
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
  });
