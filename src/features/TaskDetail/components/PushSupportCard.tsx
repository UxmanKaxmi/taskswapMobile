import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import HelperAvatarStack from '@features/Home/components/HelperAvatarStack';
import { ms, vs } from 'react-native-size-matters';

type PushEvent = {
  createdAt?: string;
  pushedAt?: string;
  user: {
    id: string;
    name: string;
    photo: string;
  };
};

type Props = {
  pushes: PushEvent[];
  isOwner: boolean;
  currentUserId?: string;
  didUserPush: boolean; // 🔒 explicit signal only
  emptyStateTitle?: string;
  emptyStateDescription?: ReactNode;
};

export default function PushSupportCard({
  pushes,
  isOwner,
  currentUserId,
  didUserPush,
  emptyStateTitle,
  emptyStateDescription,
}: Props) {
  /* --------------------------------------------------
     0️⃣ Normalize users (presence only, NOT intent)
  -------------------------------------------------- */
  const users = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar: string }>();

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
  const isEmptyState = !didUserPush && otherPushCount === 0;

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
  const MAX_VISIBLE = 3;
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
            You and{' '}
            <TextElement style={styles.namesStrong}>
              {otherPushCount} other{otherPushCount > 1 ? 's' : ''}
            </TextElement>{' '}
            pushed this.
          </TextElement>
        </View>
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

  const showSelfPushOnlyFooter = didUserPush && otherPushCount === 0 && !isEmptyState;

  /* --------------------------------------------------
     6️⃣ Render
  -------------------------------------------------- */
  return (
    <Shadow size="tint" style={isEmptyState ? styles.emptyShadow : styles.card}>
      {isEmptyState ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyLeft}>
            <View style={styles.emptyIconCircle}>
              <Icon name="lightbulb" set="fa6" size={14} color={colors.motivationBgHardest} />
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
          <View
            style={[
              styles.header,
              {
                marginBottom: displayUsers.length > 0 ? spacing.md : 0,
              },
            ]}
          >
            <View style={styles.iconWrap}>
              <Icon name="lightbulb" set="fa6" size={14} color={colors.motivationBgHardest} />
            </View>
            <TextElement
              variant="title"
              style={[
                styles.title,
                {
                  fontWeight: displayUsers.length > 0 ? '600' : '500',
                  fontSize: displayUsers.length > 0 ? ms(18) : ms(15),
                  color: colors.text,
                },
              ]}
            >
              {title}
            </TextElement>
          </View>

          {/* Avatars (others only) */}
          {displayUsers.length > 0 && (
            <View style={styles.avatars}>
              <HelperAvatarStack helpers={displayUsers} size={40} maxVisible={3} />
            </View>
          )}

          {/* Description */}
          {displayUsers.length > 0 &&
            (showSelfPushOnlyFooter ? (
              <View style={styles.selfPushFooterRow}>
                <View style={styles.dot} />
                <TextElement style={styles.description}>{description}</TextElement>
              </View>
            ) : (
              <TextElement style={styles.description}>{description}</TextElement>
            ))}

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

/* --------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  emptyShadow: {
    borderRadius: 16,
  },

  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
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
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.motivationIconBackground,
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
    backgroundColor: colors.onPrimary,
    borderRadius: 28,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    // alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.motivationIconBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    fontSize: ms(20),
    fontWeight: '700',
    color: colors.text,
  },
  avatars: {
    marginBottom: spacing.md,
  },
  description: {
    fontSize: ms(12),
    color: colors.placeHolder,
  },
  selfPushFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pushTogetherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pushTogetherText: {
    fontSize: ms(12),
    color: colors.placeHolder,
    flex: 1,
  },
  namesStrong: {
    fontSize: ms(12),
    fontWeight: '600',
    color: colors.text,
  },
  namesMuted: {
    fontSize: ms(12),
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    top: vs(4),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.motivationBgHardest,
    marginRight: 12,
  },
  time: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '400',
  },
});
