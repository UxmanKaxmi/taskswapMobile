import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { ms } from 'react-native-size-matters';
import { ThemeColors, useThemedStyles } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow';
import Avatar from '@shared/components/Avatar/Avatar';
import { getAvatarColor } from '@shared/utils/avatarColor';

type Helper = {
  id: string;
  name?: string;
  avatar?: string | null;
};

type Props = {
  helpers: Helper[];
  size?: number;
  maxVisible?: number;
  moreStyle?: StyleProp<ViewStyle>;
  moreTextStyle?: StyleProp<TextStyle>;
  marginLeft?: number;
};

export default function HelperAvatarStack({
  helpers,
  size = ms(40),
  maxVisible = 3,
  moreStyle,
  moreTextStyle,
  marginLeft = 0.35,
}: Props) {
  const styles = useThemedStyles(createStyles);
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
              marginLeft: index === 0 ? 0 : -size * marginLeft,
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
            // borderColor={'transarent'}
            fallbackStyle={{ backgroundColor: getAvatarColor(helper.id || helper.name) }}
            textStyle={styles.avatarText}
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
              marginLeft: -size * marginLeft,
            },
            moreStyle,
          ]}
        >
          <TextElement style={[styles.moreText, moreTextStyle]}>+{remaining}</TextElement>
        </View>
      )}
    </View>
  );
}
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatarWrap: {
      // borderWidth: 1,
      // borderColor: colors.card,
      backgroundColor: colors.card,
    },

    more: {
      backgroundColor: colors.motivationIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      // borderWidth: 1,
      // borderColor: colors.motivationIconBackground,
    },

    moreText: {
      fontSize: ms(12),
      fontWeight: '700',
      color: colors.motivationBgHardest,
    },
    avatarText: {
      color: colors.tactileMomentumSecondary,
      fontWeight: '800',
    },
    avatar: {},
  });
