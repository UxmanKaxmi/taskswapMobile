import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import HelperAvatarStack from '@features/Home/components/HelperAvatarStack';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { vs } from 'react-native-size-matters';
import { Height } from '@shared/components/Spacing';

type PushEvent = {
  createdAt: string;
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
};

export default function PushSupportCard({ pushes, isOwner, currentUserId, didUserPush }: Props) {
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

  /* --------------------------------------------------
     2️⃣ Latest push time (recency wins)
  -------------------------------------------------- */
  const latestPushAt = useMemo(() => {
    const times = pushes.map(p => new Date(p.createdAt).getTime()).filter(Number.isFinite);

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
    if (!didUserPush && otherPushCount === 0) {
      return isOwner ? 'No support yet.' : 'Be the first to support.';
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
  }, [isOwner, didUserPush, otherPushCount]);

  /* --------------------------------------------------
     5️⃣ Description logic
  -------------------------------------------------- */
  const description = useMemo(() => {
    // EMPTY STATE
    if (!didUserPush && otherPushCount === 0) {
      return isOwner ? (
        <>You can support yourself to stay on track.</>
      ) : (
        <>Send a push to encourage this task.</>
      );
    }

    if (isOwner && didUserPush && otherPushCount === 0) {
      return <>You pushed yourself to stay on track.</>;
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
        <>
          You and{' '}
          <TextElement style={styles.namesStrong}>
            {otherPushCount} other{otherPushCount > 1 ? 's' : ''}
          </TextElement>{' '}
          pushed this.
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
  }, [isOwner, didUserPush, otherPushCount, visibleNames, remainingCount]);

  /* --------------------------------------------------
   Visibility decision (AFTER all hooks)
-------------------------------------------------- */

  const displayUsers = useMemo(() => {
    if (!didUserPush) return otherUsers;

    const me = users.find(u => u.id === currentUserId);
    if (!me) return otherUsers;

    return [me, ...otherUsers];
  }, [didUserPush, users, otherUsers, currentUserId]);

  /* --------------------------------------------------
     6️⃣ Render
  -------------------------------------------------- */
  return (
    <Shadow size="tint" style={styles.card}>
      {/* Header */}
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
          style={[
            styles.title,
            {
              fontWeight: displayUsers.length > 0 ? '700' : '500',
              fontSize: displayUsers.length > 0 ? 20 : 17,
              color: displayUsers.length > 0 ? colors.text : colors.muted,
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
      {displayUsers.length > 0 && <TextElement style={styles.names}>{description}</TextElement>}
      {/* 
      {displayUsers.length > 0 && (
        <AppBorder
          style={{
            backgroundColor: colors.motivationBgHard,
            marginTop: vs(10),

            marginBottom: vs(6),
          }}
        />
      )} */}
      {/* Time */}
      {displayUsers.length > 0 && (
        <View style={styles.timeRow}>
          <View style={styles.dot} />
          {latestPushAt && <TextElement style={styles.time}>{timeAgo(latestPushAt)}</TextElement>}
        </View>
      )}
    </Shadow>
  );
}

/* --------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.onPrimary,
    borderRadius: 28,
    padding: spacing.lg,
    alignItems: 'flex-start',
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  avatars: {
    marginBottom: spacing.md,
  },
  names: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  namesStrong: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  namesMuted: {
    fontSize: 15,
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
