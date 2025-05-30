// src/features/MyProfile/components/ProfileHeader.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import Row from '@shared/components/Layout/Row';
import { spacing, colors, typography } from '@shared/theme';
import Column from '@shared/components/Layout/Column';
import { moderateScale, ms, verticalScale, vs } from 'react-native-size-matters';
import { Height, Width } from '@shared/components/Spacing';

type Props = {
  avatarUri?: string;
  name: string;
  username: string;
  following: number;
  followers: number;
  heFollowsYou: boolean;
  youFollowHim: boolean;
  email: string;
  onPressToggleFollow: () => void;
};

export default function FriendsProfileHeader({
  avatarUri,
  name,
  username,
  following,
  followers,
  email,
  heFollowsYou,
  youFollowHim,
  // tasksDone,
  // taskSuccessRate,
  // dayStreak,
  onPressToggleFollow,
}: Props) {
  return (
    <Row fullWidth style={{}}>
      <View style={styles.card}>
        {/* <Avatar uri={avatarUri} size={100} /> */}
        <Row align="flex-start" justify="flex-start">
          <Avatar uri={avatarUri} size={vs(80)} />

          <Column style={{ marginLeft: spacing.md }}>
            <Row style={styles.topRow}>
              <View style={styles.nameContainer}>
                <TextElement variant="title" weight="600" style={styles.name}>
                  {name}
                </TextElement>
                <TextElement variant="subtitle" color="muted" style={styles.username}>
                  {email}
                </TextElement>
              </View>
            </Row>

            <Row style={styles.statsRow}>
              <View style={styles.stat}>
                <TextElement style={styles.followingHeading} weight="600">
                  {following}
                </TextElement>
                <TextElement style={styles.followingValue} variant="caption" color="muted">
                  Following
                </TextElement>
              </View>
              <Width size={15} />
              <View style={styles.stat}>
                <TextElement style={styles.followingHeading} variant="body" weight="600">
                  {followers >= 1000 ? `${Math.floor(followers / 100) / 10}k` : followers}
                </TextElement>
                <TextElement style={styles.followingValue} variant="caption" color="muted">
                  Followers
                </TextElement>
              </View>
            </Row>
          </Column>
        </Row>
        {/* {youFollowHim && <TextElement>You are following this user</TextElement>}
        {heFollowsYou && <TextElement>This user follows you</TextElement>} */}
        {/* <Height size={20} /> */}
        {/* {youFollowHim && heFollowsYou && (
          <TextElement variant="caption">You both follow each other ✅</TextElement>
        )} */}
        <Row justify="flex-start" style={styles.buttonsRow}>
          {youFollowHim ? (
            <PrimaryButton
              textStyle={styles.buttonText}
              title={'Following'}
              onPress={() => onPressToggleFollow()}
              style={styles.editBtn}
            />
          ) : (
            <OutlineButton
              textStyle={styles.buttonText}
              title={'Follow'}
              onPress={() => onPressToggleFollow()}
              style={styles.editBtn}
            />
          )}
        </Row>
      </View>
    </Row>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontSize: moderateScale(12),
  },
  followingValue: {
    fontSize: moderateScale(14),
  },
  followingHeading: {
    fontSize: moderateScale(16),
  },
  card: {
    flex: 1,
    borderRadius: spacing.sm,
    padding: spacing.md,
    paddingBottom: 0,
    paddingTop: 0,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    width: '100%',
  },
  topRow: {
    alignSelf: 'flex-start',
  },
  nameContainer: {
    // marginLeft: spacing.md,
  },
  name: {},
  username: {
    fontSize: ms(14),
  },
  statsRow: {
    // alignSelf: 'flex-start',
    // marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'flex-start',
  },
  buttonsRow: {},
  editBtn: {
    height: verticalScale(30),
    flex: 1,
    // marginRight: spacing.sm,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
  },
  shareBtn: {
    height: verticalScale(30),
    flex: 1 / 2,
    borderRadius: spacing.sm,
    // marginRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  shareText: {
    color: colors.text,
  },
});
