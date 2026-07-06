// src/features/friends/components/FriendFollowRow.tsx

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { useTheme } from '@shared/theme/useTheme';
import { moderateScale, ms, vs } from 'react-native-size-matters';
import Avatar from '@shared/components/Avatar/Avatar';
import { getAvatarColor } from '@shared/utils/avatarColor';
import { ThemeColors, useThemedStyles } from '@shared/theme';
type Props = {
  userId?: string | null;
  name: string;
  username?: string | null;
  isFollowing: boolean;
  onToggleFollow: () => void;
  photo?: string;
  isLoading: boolean;
  onPressRow: () => void;
};

export default function FriendFollowRow({
  userId,
  name,
  username,
  isFollowing,
  photo,
  isLoading,
  onToggleFollow,
  onPressRow,
}: Props) {
  const { colors, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);
  const handle = username?.trim() ? `@${username.trim()}` : null;

  return (
    <Pressable
      onPress={() => onPressRow()}
      style={[styles.container, { borderColor: colors.border, paddingVertical: vs(11) }]}
    >
      <View style={styles.leftSection}>
        <Avatar
          uri={photo}
          fallback={name}
          size={44}
          borderColor="transparent"
          fallbackStyle={{ backgroundColor: getAvatarColor(userId || name) }}
          textStyle={styles.avatarText}
        />
        <View style={styles.textContainer}>
          <TextElement style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </TextElement>
          {handle ? (
            <TextElement
              variant="caption"
              style={styles.emailText}
              color="muted"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {handle}
            </TextElement>
          ) : null}
        </View>
      </View>
      <OutlineButton
        isLoading={isLoading}
        title={isFollowing ? 'Following' : 'Follow'}
        onPress={onToggleFollow}
        type={isFollowing ? 'default' : 'alt'}
        backgroundColor={isFollowing ? colors.tactileMomentumPrimary : colors.onboardingInk}
        borderColor={isFollowing ? colors.onboardingLine : colors.onboardingInk}
        textColor={isFollowing ? colors.tactileMomentumSecondary : colors.onboardingCard}
        textStyle={{ fontSize: moderateScale(12), fontWeight: '700' }}
        style={styles.button}
      />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    avatarText: {
      color: colors.onboardingInk,
      fontWeight: '800',
    },
    nameText: {
      fontSize: moderateScale(15),
      fontWeight: '700',
    },
    emailText: {
      fontSize: moderateScale(12),
      marginTop: vs(1),
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: ms(10),
    },
    textContainer: {
      flexShrink: 1,
      marginLeft: 10,
    },
    button: {
      minWidth: ms(96),
      borderRadius: 999,
      paddingVertical: vs(7),
      paddingHorizontal: ms(14),
    },
  });
