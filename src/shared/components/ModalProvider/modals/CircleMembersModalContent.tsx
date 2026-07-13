import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useThemedStyles } from '@shared/theme';
import type { CircleMembersModalPayload } from '../modalTypes';
import { navigationRef } from '@navigation/navigationRef';

type Props = {
  payload: CircleMembersModalPayload;
  closeModal: () => void;
};

export default function CircleMembersModalContent({ payload, closeModal }: Props) {
  const styles = useThemedStyles(createStyles);
  const { members } = payload;

  const openProfile = React.useCallback(
    (userId: string) => {
      if (!userId || !navigationRef.isReady()) return;

      closeModal();

      globalThis.requestAnimationFrame(() => {
        if (userId === payload.currentUserId) {
          navigationRef.navigate('App', {
            screen: 'Tabs',
            params: { screen: 'Profile' },
          } as any);
          return;
        }

        navigationRef.navigate('App', {
          screen: 'FriendsProfileScreen',
          params: { id: userId },
        } as any);
      });
    },
    [closeModal, payload.currentUserId],
  );

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <TextElement style={styles.title}>{payload.title ?? 'People in this circle'}</TextElement>
        <TextElement style={styles.subtitle}>
          {payload.subtitle ??
            `${members.length} ${members.length === 1 ? 'person' : 'people'} doing this together`}
        </TextElement>
      </View>

      <View style={styles.list}>
        {members.map(member => (
          <Pressable
            key={member.userId}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => openProfile(member.userId)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${member.name || member.displayName}'s profile`}
          >
            <Avatar
              uri={member.avatar || undefined}
              fallback={member.name?.[0] ?? member.displayName?.[0] ?? '?'}
              size={ms(42)}
            />
            <View style={styles.rowText}>
              <TextElement style={styles.memberName}>
                {member.name || member.displayName}
              </TextElement>
              <TextElement style={styles.memberStatus}>{member.status}</TextElement>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      paddingBottom: vs(12),
    },
    header: {
      marginBottom: vs(14),
    },
    title: {
      fontSize: ms(20),
      lineHeight: ms(24),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    subtitle: {
      marginTop: vs(4),
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '500',
      color: colors.onboardingMuted,
    },
    list: {
      gap: vs(10),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: vs(8),
      paddingHorizontal: spacing.sm,
      borderRadius: 18,
      backgroundColor: colors.onboardingPaper,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
    },
    rowPressed: {
      opacity: 0.72,
    },
    rowText: {
      flex: 1,
      minWidth: 0,
    },
    memberName: {
      fontSize: ms(15),
      lineHeight: ms(19),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    memberStatus: {
      marginTop: vs(2),
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '500',
      color: colors.onboardingMuted,
    },
  });
