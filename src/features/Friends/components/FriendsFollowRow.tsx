// src/features/friends/components/FriendFollowRow.tsx

import React from 'react';
import { Image, View, StyleSheet, Pressable } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { useTheme } from '@shared/theme/useTheme';
import { moderateScale, ms, vs } from 'react-native-size-matters';
import { typography } from '@shared/theme';
import Avatar from '@shared/components/Avatar/Avatar';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from 'navigation/navigation';

type Props = {
  name: string;
  email: string;
  isFollowing: boolean;
  onToggleFollow: () => void;
  photo?: string;
  isLoading: boolean;
  onPressRow: () => void;
};

export default function FriendFollowRow({
  name,
  email,
  isFollowing,
  photo,
  isLoading,
  onToggleFollow,
  onPressRow,
}: Props) {
  const { colors, spacing } = useTheme();

  return (
    <Pressable
      onPress={() => onPressRow()}
      style={[styles.container, { borderColor: colors.border, paddingVertical: spacing.sm }]}
    >
      <View style={styles.leftSection}>
        <Avatar uri={photo} size={45} borderColor="#5C6BC0" />
        <View style={styles.textContainer}>
          <TextElement variant="body" weight="600">
            {name}
          </TextElement>
          <TextElement variant="caption" style={styles.emailText} color="muted">
            {email}
          </TextElement>
        </View>
      </View>

      <OutlineButton
        isLoading={isLoading}
        title={isFollowing ? 'Following' : 'Follow'}
        onPress={onToggleFollow}
        type={isFollowing ? 'alt' : 'default'}
        textStyle={{
          color: isFollowing ? colors.onAccent : colors.primary,
          fontSize: moderateScale(10),
        }}
        style={styles.button}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emailText: {
    fontSize: moderateScale(13),
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
  avatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    marginRight: ms(10),
  },
  textContainer: {
    flexShrink: 1,
    marginLeft: 10,
  },
  button: {
    width: ms(90),
    height: ms(40),
  },
});
