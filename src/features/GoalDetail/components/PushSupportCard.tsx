import React, { ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { getFirstName, timeAgo } from '@shared/utils/helperFunctions';
import HelperAvatarStack from '@features/Home/components/HelperAvatarStack';
import { ms, vs } from 'react-native-size-matters';
import { useModal } from '@shared/components/ModalProvider';

type PushEvent = {
  createdAt?: string;
  pushedAt?: string;
  message?: string | null;
  user?: {
    id: string;
    name: string;
    photo?: string | null;
  };
};

type Props = {
  pushes: PushEvent[];
  isOwner: boolean;
  currentUserId?: string;
  didUserPush: boolean; // 🔒 explicit signal only
  /** Authoritative total push count (may exceed the pusher list we have, e.g. for guests) */
  pushCount?: number;
  emptyStateTitle?: string;
  emptyStateDescription?: ReactNode;
  cheerSummary?: {
    ownerName: string;
    beatType: 'post' | 'update';
    cheerCount: number;
    distinctCheererCount: number;
    viewerHasCheered?: boolean;
  };
};

export default function PushSupportCard({
  pushes,
  isOwner,
  currentUserId,
  didUserPush,
  pushCount,
  emptyStateTitle,
  emptyStateDescription,
  cheerSummary,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { openCircleMembersSheet } = useModal();
  /* --------------------------------------------------
     0️⃣ Normalize users (presence only, NOT intent)
  -------------------------------------------------- */
  const users = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string | null }>();

    pushes.forEach(p => {
      if (!p.user) return;
      map.set(p.user.id, {
        id: p.user.id,
        name: p.user.name,
        avatar: p.user.photo,
      });
    });

    return Array.from(map.values());
  }, [pushes]);

  const otherUsers = useMemo(
    () => users.filter(u => u.id !== currentUserId),
    [users, currentUserId],
  );

  const otherPushCount = otherUsers.length;
  // The known pushers we have details for (others + self if pushed).
  const knownTotal = otherPushCount + (didUserPush ? 1 : 0);
  // Authoritative count — the server count can be higher than the list we got
  // (e.g. a signed-out viewer receives the count but not the pusher details).
  const resolvedCount = Math.max(pushCount ?? 0, knownTotal);
  // Genuinely empty only when there are zero pushes at all.
  const isEmptyState = resolvedCount === 0;
  // We have a count but no pusher details to render avatars/names for.
  const hasCountOnly = resolvedCount > knownTotal;

  /* --------------------------------------------------
     2️⃣ Latest push time (recency wins)
  -------------------------------------------------- */
  const latestPushAt = useMemo(() => {
    const times = pushes
      .map(p => new Date(p.createdAt ?? p.pushedAt ?? '').getTime())
      .filter(Number.isFinite);

    if (!times.length) return null;
    return new Date(Math.max(...times)).toISOString();
  }, [pushes]);

  /* --------------------------------------------------
     3️⃣ Names display logic
  -------------------------------------------------- */
  const MAX_VISIBLE = 2;
  const visibleNames = otherUsers.slice(0, MAX_VISIBLE).map(u => u.name);
  const remainingCount = Math.max(otherPushCount - MAX_VISIBLE, 0);

  /* --------------------------------------------------
     4️⃣ Title logic (FINAL & CORRECT)
  -------------------------------------------------- */
  const title = useMemo(() => {
    // EMPTY STATE
    if (isEmptyState) {
      return emptyStateTitle ?? (isOwner ? 'No support yet.' : 'Be the first to support.');
    }

    // OWNER
    if (isOwner) {
      if (otherPushCount > 0) return "You've got support.";
      if (didUserPush) return 'You committed to this.';
    }

    // NON-OWNER
    if (didUserPush && otherPushCount > 0) return 'You joined the support.';
    if (didUserPush) return 'You pushed this.';

    return 'Support received';
  }, [isOwner, didUserPush, otherPushCount, isEmptyState, emptyStateTitle]);

  /* --------------------------------------------------
     5️⃣ Description logic
  -------------------------------------------------- */
  const description = useMemo(() => {
    // EMPTY STATE
    if (isEmptyState) {
      if (emptyStateDescription != null) return emptyStateDescription;
      return isOwner ? (
        <>You can support yourself to stay on track.</>
      ) : (
        <>Send a push to encourage this task.</>
      );
    }

    // OWNER
    if (isOwner) {
      return (
        <>
          From <TextElement style={styles.namesStrong}>{visibleNames.join(', ')}</TextElement>
          {remainingCount > 0 && (
            <>
              {', and '}
              <TextElement style={styles.namesMuted}>
                {remainingCount} other{remainingCount > 1 ? 's' : ''}
              </TextElement>
            </>
          )}
          .
        </>
      );
    }

    // NON-OWNER — self push only
    if (didUserPush && otherPushCount === 0) {
      return <>You pushed this to show support.</>;
    }

    // NON-OWNER — self + others
    if (didUserPush && otherPushCount > 0) {
      return (
        <View style={styles.pushTogetherRow}>
          <View style={styles.dot} />
          <TextElement style={styles.pushTogetherText}>
            <TextElement style={styles.namesStrong}>You</TextElement> and{' '}
            <TextElement style={styles.namesStrong}>
              {otherPushCount} other{otherPushCount > 1 ? 's' : ''}
            </TextElement>{' '}
            pushed this.
          </TextElement>
        </View>
      );
    }

    // NON-OWNER — count only (we have a count but no pusher details, e.g. guest)
    if (visibleNames.length === 0) {
      return (
        <>
          <TextElement style={styles.namesStrong}>{resolvedCount}</TextElement>{' '}
          {resolvedCount === 1 ? 'person' : 'people'} pushed this.
        </>
      );
    }

    // NON-OWNER — others only
    return (
      <>
        <TextElement style={styles.namesStrong}>{visibleNames.join(', ')}</TextElement>
        {remainingCount > 0 && (
          <>
            {', and '}
            <TextElement style={styles.namesMuted}>
              {remainingCount} other{remainingCount > 1 ? 's' : ''}
            </TextElement>
          </>
        )}{' '}
        pushed this.
      </>
    );
  }, [
    isOwner,
    didUserPush,
    otherPushCount,
    visibleNames,
    remainingCount,
    resolvedCount,
    isEmptyState,
    emptyStateDescription,
  ]);

  /* --------------------------------------------------
   Visibility decision (AFTER all hooks)
-------------------------------------------------- */

  const displayUsers = useMemo(() => {
    if (!didUserPush) return otherUsers;

    const me = users.find(u => u.id === currentUserId);
    if (!me) return otherUsers;

    return [me, ...otherUsers];
  }, [didUserPush, users, otherUsers, currentUserId]);
  const supportMembers = useMemo(
    () =>
      displayUsers.map(user => ({
        userId: user.id,
        name: user.name,
        avatar: user.avatar ?? '',
        displayName: getFirstName(user.name) || user.name,
        status: 'Pushed this',
      })),
    [displayUsers],
  );

  const openSupportersSheet = React.useCallback(() => {
    if (supportMembers.length === 0) return;
    openCircleMembersSheet({
      title: 'People who pushed this',
      subtitle: `${supportMembers.length} ${
        supportMembers.length === 1 ? 'person' : 'people'
      } sent support`,
      currentUserId,
      members: supportMembers,
    });
  }, [currentUserId, openCircleMembersSheet, supportMembers]);

  const showSelfPushOnlyFooter =
    didUserPush && otherPushCount === 0 && !hasCountOnly && !isEmptyState;
  const iconName = 'bolt';
  const shouldShowDescription = !isEmptyState;
  const cheerSummaryParts = useMemo(() => buildCheerSummaryParts(cheerSummary), [cheerSummary]);

  /* --------------------------------------------------
     6️⃣ Render
  -------------------------------------------------- */
  return (
    <Shadow size="tint" style={isEmptyState ? styles.emptyShadow : styles.card}>
      {isEmptyState ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyLeft}>
            <View style={styles.emptyIconCircle}>
              <Icon
                name={iconName}
                set="fa6"
                iconStyle="solid"
                size={15}
                color={colors.tactileMomentumSecondary}
              />
            </View>

            <View style={styles.emptyTextWrap}>
              <TextElement variant="caption" style={styles.emptyTitle}>
                {title}
              </TextElement>

              {emptyStateDescription != null && (
                <TextElement variant="caption" color="muted" style={styles.emptyDescription}>
                  {emptyStateDescription}
                </TextElement>
              )}
            </View>
          </View>

          {/* <Icon set="ion" name="chevron-forward" size={ms(18)} color={colors.muted} /> */}
        </View>
      ) : (
        <>
          <View style={[styles.header, { marginBottom: spacing.md }]}>
            <View style={styles.iconWrap}>
              <Icon
                name={iconName}
                set="fa6"
                iconStyle="solid"
                size={15}
                color={colors.tactileMomentumSecondary}
              />
            </View>
            <TextElement
              variant="title"
              style={[
                styles.title,
                {
                  fontWeight: '700',
                  fontSize: ms(18),
                  color: colors.onboardingInk,
                },
              ]}
            >
              {title}
            </TextElement>
          </View>

          {displayUsers.length > 0 && (
            <>
              <Pressable
                style={({ pressed }) => [styles.avatars, pressed && styles.inlinePressed]}
                onPress={openSupportersSheet}
                accessibilityRole="button"
                accessibilityLabel="Show everyone who pushed this"
              >
                <HelperAvatarStack
                  helpers={displayUsers}
                  size={40}
                  maxVisible={3}
                  moreStyle={styles.supportCountBubble}
                  moreTextStyle={styles.supportCountText}
                />
              </Pressable>

              {/* <View style={styles.summaryDivider} /> */}
            </>
          )}

          {/* Description */}
          {shouldShowDescription &&
            (displayUsers.length > 0 ? (
              <Pressable
                onPress={openSupportersSheet}
                accessibilityRole="button"
                accessibilityLabel="Show everyone who pushed this"
                style={({ pressed }) => pressed && styles.inlinePressed}
              >
                {showSelfPushOnlyFooter ? (
                  <View style={styles.selfPushFooterRow}>
                    <View style={styles.dot} />
                    <TextElement style={styles.description}>{description}</TextElement>
                  </View>
                ) : (
                  <TextElement style={styles.description}>{description}</TextElement>
                )}
              </Pressable>
            ) : showSelfPushOnlyFooter ? (
              <View style={styles.selfPushFooterRow}>
                <View style={styles.dot} />
                <TextElement style={styles.description}>{description}</TextElement>
              </View>
            ) : (
              <TextElement style={styles.description}>{description}</TextElement>
            ))}

          {cheerSummaryParts && (
            <View style={styles.cheerSummaryRow}>
              <Icon set="ion" name="sparkles" size={ms(10)} color={colors.onboardingPushDeep} />
              <TextElement style={styles.cheerSummaryText}>
                <TextElement style={styles.cheerSummaryStrong}>
                  {cheerSummaryParts.people}
                </TextElement>
                <TextElement style={styles.description}> cheered </TextElement>
                <TextElement style={styles.cheerSummaryStrong}>
                  {cheerSummaryParts.ownerPossessive}
                </TextElement>{' '}
                <TextElement style={styles.description}>{cheerSummaryParts.subject}</TextElement>
                {cheerSummaryParts.extraCheers && (
                  <>
                    {' · '}
                    <TextElement style={styles.cheerSummaryStrong}>
                      {cheerSummaryParts.extraCheers}
                    </TextElement>
                  </>
                )}
                .
              </TextElement>
            </View>
          )}

          {/* Time */}
          {displayUsers.length > 0 && (
            <View style={styles.timeRow}>
              {latestPushAt && (
                <TextElement style={styles.time}>{timeAgo(latestPushAt)}</TextElement>
              )}
            </View>
          )}
        </>
      )}
    </Shadow>
  );
}

function buildCheerSummaryParts(cheerSummary?: Props['cheerSummary']) {
  if (!cheerSummary || cheerSummary.cheerCount <= 0 || cheerSummary.distinctCheererCount <= 0) {
    return null;
  }

  const peopleCount = cheerSummary.distinctCheererCount;
  const ownerName = getFirstName(cheerSummary.ownerName);
  const subject = cheerSummary.beatType === 'post' ? 'task' : 'latest update';
  const otherCheererCount = Math.max(peopleCount - 1, 0);
  const peopleLabel = peopleCount === 1 ? 'person' : 'people';
  const peopleText = cheerSummary.viewerHasCheered
    ? otherCheererCount > 0
      ? `You and ${otherCheererCount} other${otherCheererCount === 1 ? '' : 's'}`
      : 'You'
    : `${peopleCount} ${peopleLabel}`;
  const extraCheersText =
    cheerSummary.cheerCount > peopleCount
      ? `${cheerSummary.cheerCount} ${cheerSummary.cheerCount === 1 ? 'cheer' : 'cheers'}`
      : null;

  return {
    people: peopleText,
    ownerPossessive: `${ownerName}'s`,
    subject,
    extraCheers: extraCheersText,
  };
}

/* --------------------------------------------------
   Styles
-------------------------------------------------- */
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    emptyShadow: {
      borderRadius: 24,
    },

    emptyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: spacing.md,
      paddingVertical: vs(10),
    },

    emptyLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },

    emptyIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onboardingPush,
    },

    emptyTextWrap: {
      flex: 1,
    },

    emptyTitle: {
      fontSize: ms(13),
      fontWeight: '500',
      color: colors.text,
    },

    emptyDescription: {
      fontSize: ms(11),
    },

    card: {
      backgroundColor: colors.onboardingCard,
      borderRadius: 24,
      paddingHorizontal: ms(18),
      paddingVertical: vs(16),
      // alignItems: 'flex-start',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(22),
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 14,
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    title: {
      flex: 1,
      fontSize: ms(20),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    avatars: {
      marginBottom: vs(16),
      alignSelf: 'flex-start',
      borderRadius: 999,
    },
    inlinePressed: {
      opacity: 0.65,
    },
    summaryDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.onboardingLine,
      marginBottom: vs(14),
    },
    supportCountBubble: {
      backgroundColor: colors.tactileMomentumPrimary,
      borderColor: colors.tactileMomentumPrimary,
    },
    supportCountText: {
      color: colors.tactileMomentumSecondary,
    },
    description: {
      fontSize: ms(12),
      color: colors.muted,
    },
    selfPushFooterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    cheerSummaryRow: {
      marginTop: vs(4),
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: ms(5),
    },
    cheerSummaryText: {
      flex: 1,
      fontSize: ms(12),
      fontWeight: '700',
      color: colors.muted,
    },
    cheerSummaryStrong: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    pushTogetherRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    pushTogetherText: {
      fontSize: ms(12),
      color: colors.muted,
      flex: 1,
    },
    namesStrong: {
      fontSize: ms(12),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    namesMuted: {
      fontSize: ms(12),
      fontWeight: '600',
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: vs(14),
    },
    dot: {
      width: ms(6),
      height: ms(6),
      borderRadius: ms(3),
      backgroundColor: colors.onboardingPushDeep,
      marginRight: ms(10),
      marginLeft: ms(2),
    },
    time: {
      fontSize: ms(13),
      color: colors.muted,
      fontWeight: '700',
    },
  });
