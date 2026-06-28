// src/features/MyProfile/components/ProfileHeader.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import { getAvatarColor } from '@shared/utils/avatarColor';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { spacing, colors } from '@shared/theme';
import Column from '@shared/components/Layout/Column';
import { ms, vs } from 'react-native-size-matters';
import { Width } from '@shared/components/Spacing';

type Props = {
  userId?: string | null;
  avatarUri?: string | null;
  name: string;
  username: string;
  following: number;
  followers: number;

  onEditProfile: () => void;
  onShareProfile: () => void;
};

export default function ProfileHeader({
  userId,
  avatarUri,
  name,
  username,
  following,
  followers,
}: Props) {
  const avatarColor = getAvatarColor(userId || name);

  return (
    <Row fullWidth>
      <View style={styles.card}>
        <Row align="center" justify="flex-start" style={styles.profileRow}>
          <Avatar
            uri={avatarUri}
            fallback={name}
            size={ms(74)}
            borderColor="transparent"
            fallbackStyle={{ ...styles.avatarFallback, backgroundColor: avatarColor }}
            textStyle={styles.avatarText}
          />

          <Column style={styles.infoColumn}>
            <Row style={styles.topRow}>
              <View style={styles.nameContainer}>
                <TextElement weight="800" style={styles.name} numberOfLines={1}>
                  {name}
                </TextElement>
                <TextElement color="muted" style={styles.username} numberOfLines={1}>
                  {username}
                </TextElement>
              </View>
            </Row>

            <Row style={styles.statsRow}>
              <View style={styles.stat}>
                <TextElement style={styles.followingHeading} weight="600">
                  {following}
                </TextElement>
                <TextElement style={styles.followingValue} color="muted">
                  FOLLOWING
                </TextElement>
              </View>
              <Width size={ms(22)} />
              <View style={styles.stat}>
                <TextElement style={styles.followingHeading} weight="600">
                  {followers >= 1000 ? `${Math.floor(followers / 100) / 10}k` : followers}
                </TextElement>
                <TextElement style={styles.followingValue} color="muted">
                  FOLLOWERS
                </TextElement>
              </View>
            </Row>
          </Column>
        </Row>
      </View>
    </Row>
  );
}

const styles = StyleSheet.create({
  followingValue: {
    fontSize: ms(10),
    letterSpacing: 0.5,
    lineHeight: ms(14),
  },
  followingHeading: {
    color: colors.onboardingInk,
    fontSize: ms(16),
    lineHeight: ms(20),
  },
  card: {
    flex: 1,
    borderRadius: 0,
    padding: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    width: '100%',
  },
  profileRow: {
    minHeight: vs(88),
  },
  avatarFallback: {
    borderWidth: 0,
  },
  avatarText: {
    color: colors.onboardingInk,
    fontSize: ms(34),
    lineHeight: ms(42),
    fontWeight: '800',
  },
  infoColumn: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topRow: {
    alignSelf: 'flex-start',
  },
  nameContainer: {
    maxWidth: '100%',
  },
  name: {
    color: colors.onboardingInk,
    fontSize: ms(21),
    lineHeight: ms(26),
    letterSpacing: 0,
  },
  username: {
    color: colors.onboardingMuted,
    lineHeight: ms(16),
    fontSize: ms(12),
  },
  statsRow: {
    marginTop: vs(8),
  },
  stat: {
    alignItems: 'flex-start',
  },
});
