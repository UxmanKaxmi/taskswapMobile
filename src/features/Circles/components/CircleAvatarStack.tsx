import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ms } from 'react-native-size-matters';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { ThemeColors, useThemedStyles } from '@shared/theme';

type StackMember = { userId: string; name: string; avatar: string };

type Props = {
  members: StackMember[];
  size?: number;
  maxVisible?: number;
};

export default function CircleAvatarStack({ members, size = 30, maxVisible = 4 }: Props) {
  const styles = useThemedStyles(createStyles);
  const visible = members.slice(0, maxVisible);
  const overflow = members.length - visible.length;

  return (
    <View style={styles.row}>
      {visible.map((member, index) => (
        <View key={member.userId} style={[styles.item, { marginLeft: index === 0 ? 0 : -ms(10) }]}>
          <Avatar uri={member.avatar || undefined} fallback={member.name?.[0] ?? '?'} size={size} />
        </View>
      ))}
      {overflow > 0 ? (
        <View
          style={[
            styles.item,
            styles.overflowBubble,
            {
              marginLeft: -ms(10),
              width: ms(size),
              height: ms(size),
              borderRadius: ms(size / 2),
            },
          ]}
        >
          <TextElement variant="caption" weight="700" style={styles.overflowText}>
            +{overflow}
          </TextElement>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    item: {
      borderWidth: 2,
      borderColor: colors.card,
      borderRadius: 999,
    },
    overflowBubble: {
      backgroundColor: colors.onboardingLine,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overflowText: {
      fontSize: ms(10),
    },
  });
