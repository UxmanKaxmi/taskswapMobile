import React from 'react';
import { View, StyleSheet } from 'react-native';
import Row from '@shared/components/Layout/Row';
import Avatar from '@shared/components/Avatar/Avatar';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import { Icon } from '@shared/components/Icons';
import HelperAvatarGroup from '@features/Home/components/HelperAvatarGroup';
import TextElement from '@shared/components/TextElement/TextElement';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';

type PushActivity =
  | {
      id: string;
      type: 'single';
      user: { name: string; avatar: string };
      createdAt: string;
    }
  | {
      id: string;
      type: 'group';
      users: { name: string; avatar: string }[];
      createdAt: string;
    };

type Props = {
  data: PushActivity[];
};

export default function PushActivityList({ data }: Props) {
  if (!data.length) {
    return (
      <TextElement color="muted" variant="caption" style={{ marginTop: spacing.sm, opacity: 0.7 }}>
        Be the first to push this motivation!
      </TextElement>
    );
  }

  const MAX_VISIBLE = 3;

  const visible = data.slice(0, MAX_VISIBLE);
  const remaining = data.slice(MAX_VISIBLE);

  return (
    <View>
      {visible.map(item => (
        <SinglePushRow key={item.id} item={item} />
      ))}

      {remaining.length > 0 && <CombinedPushRow users={remaining.flatMap(getPushUsers)} />}
    </View>
  );
}
function getPushUsers(item: PushActivity) {
  return item.type === 'single' ? [item.user] : item.users;
}

function CombinedPushRow({ users }: { users: { name: string; avatar: string }[] }) {
  const firstName = users[0]?.name;
  const othersCount = users.length - 1;

  const text =
    users.length === 1
      ? `${firstName} sent a push`
      : `${firstName} and ${othersCount} other${othersCount > 1 ? 's' : ''} sent a push`;

  return (
    <Shadow size="tint" style={styles.row}>
      <HelperAvatarGroup
        helpers={users.slice(0, 3).map((item, index) => ({
          id: `${item.name}-${index}`,
          name: item.name,
          photo: item.avatar,
        }))}
        avatarSize={40}
      />

      <View style={styles.content}>
        <TextElement style={styles.name}>{text}</TextElement>
      </View>

      <View style={styles.badge}>
        <TextElement style={styles.badgeText}>💡 Pushed</TextElement>
      </View>
    </Shadow>
  );
}
function SinglePushRow({ item }: any) {
  return (
    <Shadow size="tint" style={styles.row}>
      <Avatar uri={item.user.avatar} size={40} />

      <View style={styles.content}>
        {/* Top line */}
        <View style={styles.topRow}>
          <TextElement style={styles.name}>{item.user.name}</TextElement>
          <TextElement style={styles.time}>{timeAgo(item.createdAt)}</TextElement>
        </View>

        {/* Sub text */}
      </View>
      <View style={styles.badge}>
        <TextElement style={styles.badgeText}>💡 Pushed</TextElement>
      </View>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  row: {
    // backgroundColor: '#EEF9F3',
    backgroundColor: colors.onPrimary,
    borderRadius: 20,
    padding: spacing.md,

    // gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },

  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  topRow: {
    // flexDirection: 'row',
    alignItems: 'flex-start',
    // flex: 0.5,
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  badge: {
    backgroundColor: '#FFF4D6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C58B00',
  },

  time: {
    // marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
});
