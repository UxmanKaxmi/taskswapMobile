import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { platformShadow, spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { getFirstName } from '@shared/utils/helperFunctions';
import HelperAvatarStack from '@features/Home/components/HelperAvatarStack';

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

type Supporter = {
  id: string;
  name: string;
  avatar: string;
};

type Props = {
  ownerName: string;
  isOwner: boolean;
  createdAt: string;
  completedAt?: string | null;
  pushes: PushEvent[];
  currentUserId?: string;
  didUserPush: boolean;
};

export default function CompletedSupportCard({
  ownerName,
  isOwner,
  createdAt,
  completedAt,
  pushes,
  currentUserId,
  didUserPush,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const users = useMemo<Supporter[]>(
    () =>
      pushes
        .filter(push => !!push?.user)
        .map(push => ({
          id: push.user!.id,
          name: push.user!.name,
          avatar: push.user!.photo ?? '',
        })),
    [pushes],
  );

  const ownerFirstName = getFirstName(ownerName);
  const ownerLabel = isOwner ? 'You' : ownerFirstName;

  const title = `${ownerLabel} completed this request`;

  const displayUsers = useMemo(() => {
    if (!didUserPush) return users;

    const me = users.find(user => user.id === currentUserId);
    if (!me) return users;

    return [me, ...users.filter(user => user.id !== currentUserId)];
  }, [didUserPush, users, currentUserId]);

  const visibleNames = displayUsers.slice(0, 3).map(user => user.name);
  const remainingCount = Math.max(displayUsers.length - visibleNames.length, 0);

  const helperNamesLine = useMemo(() => {
    if (!displayUsers.length) {
      return <>Finished without any pushes.</>;
    }

    return (
      <>
        With help from{' '}
        <TextElement style={styles.namesStrong}>{visibleNames.join(', ')}</TextElement>
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
  }, [displayUsers.length, remainingCount, visibleNames]);

  const formattedTime = useMemo(() => {
    const durationText = formatDuration(createdAt, completedAt);
    if (!durationText) return null;

    return `Finished ${durationText} after posting.`;
  }, [completedAt, createdAt]);

  const showAvatarStack = displayUsers.length > 0;
  return (
    <View>
      {/* <Height size={vs(20)} /> */}

      <SectionHeader label="Result" icon="checkmark-circle-outline" />

      <Shadow size="tint" style={styles.shadow}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <Icon
                set="ion"
                name="checkmark"
                size={ms(16)}
                color={colors.tactileMomentumSecondary}
              />
            </View>

            <TextElement variant="title" style={styles.title}>
              {title}
            </TextElement>
          </View>

          {helperNamesLine ? (
            <TextElement style={styles.helperNames}>{helperNamesLine}</TextElement>
          ) : null}

          {showAvatarStack ? (
            <View style={styles.avatars}>
              <HelperAvatarStack
                helpers={displayUsers}
                size={40}
                maxVisible={3}
                moreStyle={styles.supportCountBubble}
                moreTextStyle={styles.supportCountText}
              />
            </View>
          ) : null}

          {formattedTime ? <TextElement style={styles.time}>{formattedTime}</TextElement> : null}
        </View>
      </Shadow>
    </View>
  );
}

function formatDuration(createdAt: string, completedAt?: string | null) {
  const createdTime = new Date(createdAt).getTime();
  const completedTime = new Date(completedAt ?? '').getTime();

  if (!Number.isFinite(createdTime) || !Number.isFinite(completedTime)) return null;

  const elapsedMs = Math.max(0, completedTime - createdTime);
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));

  if (minutes < 60) {
    return `about ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.max(1, Math.round(minutes / 60));

  if (hours < 24) {
    return `about ${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = Math.max(1, Math.round(hours / 24));
  return `about ${days} day${days === 1 ? '' : 's'}`;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    shadow: {
      borderRadius: 24,
    },
    card: {
      backgroundColor: colors.onPrimary,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      paddingRight: spacing.lg,
      ...platformShadow({
        color: '#000',
        opacity: 0.08,
        radius: 16,
        offset: { width: 0, height: 10 },
      }),
      borderWidth: 1,
      borderColor: '#E6EFE8',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.tactileMomentumPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: ms(16),
      lineHeight: ms(24),
      fontWeight: '600',
      color: colors.text,
    },
    helperNames: {
      marginTop: vs(6),
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '400',
      color: colors.placeHolder,
    },
    namesStrong: {
      fontSize: ms(12),
      fontWeight: '600',
      color: colors.text,
    },
    namesMuted: {
      fontSize: ms(12),
      fontWeight: '600',
      color: colors.muted,
    },
    avatars: {
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    supportCountBubble: {
      backgroundColor: colors.tactileMomentumPrimary,
      borderColor: colors.tactileMomentumPrimary,
    },
    supportCountText: {
      color: colors.tactileMomentumSecondary,
    },
    time: {
      marginTop: vs(2),
      fontSize: ms(12),
      lineHeight: ms(16),
      color: colors.muted,
      fontWeight: '400',
    },
  });
