import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { ms } from 'react-native-size-matters';
import { colors } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow';
import Avatar from '@shared/components/Avatar/Avatar';

type Helper = {
  id: string;
  name?: string;
  avatar?: string | null;
};

type Props = {
  helpers: Helper[];
  size?: number;
  maxVisible?: number;
};

export default function HelperAvatarStack({ helpers, size = ms(40), maxVisible = 3 }: Props) {
  if (!helpers.length) return null;

  const visible = helpers.slice(0, maxVisible);
  const remaining = helpers.length - visible.length;

  return (
    <View style={styles.row}>
      {visible.map((helper, index) => (
        <Shadow
          key={helper.id}
          size="tint"
          style={[
            styles.avatarWrap,

            {
              marginLeft: index === 0 ? 0 : -size * 0.35,
              width: size,
              height: size,
              borderRadius: size / 2,
              zIndex: visible.length - index,
            },
          ]}
        >
          <Avatar
            uri={helper.avatar}
            fallback={helper.name}
            size={size}
            borderColor={colors.border}
            style={styles.avatar}
          />
        </Shadow>
      ))}

      {remaining > 0 && (
        <View
          style={[
            styles.more,

            {
              width: size,

              height: size,

              borderRadius: size / 2,

              marginLeft: -size * 0.2,
            },
          ]}
        >
          <TextElement style={styles.moreText}>+{remaining}</TextElement>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarWrap: {
    borderWidth: 1,
    borderColor: colors.card,
    backgroundColor: colors.card,
  },

  more: {
    backgroundColor: colors.motivationIconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.motivationIconBackground,
  },

  moreText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: colors.motivationBgHardest,
  },
  avatar: {},
});
