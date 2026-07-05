import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GoalHelper } from '../types/home';
import TextElement from '@shared/components/TextElement/TextElement';
import { ms } from 'react-native-size-matters';
import { colors } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow';
import Avatar from '@shared/components/Avatar/Avatar';
import { getAvatarColor } from '@shared/utils/avatarColor';

type Props = {
  helpers: GoalHelper[];
  maxVisible?: number;
  avatarSize?: number;
  containerStyle?: any;
};

export default function HelperAvatarGroup({ helpers, avatarSize = ms(38), containerStyle }: Props) {
  if (!helpers || helpers.length === 0) {
    return null;
  }

  // 🔹 Case 1: exactly ONE helper → show avatar
  if (helpers.length === 1) {
    const helper = helpers[0];

    return (
      <Shadow
        size="tint"
        style={[styles.container, containerStyle, { width: avatarSize, height: avatarSize }]}
      >
        <Avatar
          uri={helper.photo}
          fallback={helper.name}
          size={avatarSize}
          borderColor={colors.card}
          fallbackStyle={{ backgroundColor: getAvatarColor(helper.id || helper.name) }}
          textStyle={styles.avatarText}
        />
      </Shadow>
    );
  }

  // 🔹 Case 2: MORE THAN ONE helper → show +N
  return (
    <Shadow
      size="tint"
      style={[styles.container, containerStyle, { width: avatarSize, height: avatarSize }]}
    >
      <View
        style={[
          styles.more,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      >
        <TextElement
          style={[
            styles.moreText,
            {
              lineHeight: avatarSize - ms(4), // 👈 key fix
              textAlign: 'center',
            },
          ]}
        >
          +{helpers.length}
        </TextElement>
      </View>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  avatarText: {
    color: colors.onboardingInk,
    fontWeight: '800',
  },

  more: {
    backgroundColor: colors.tactileMomentumPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.tactileMomentumPrimary,
  },

  moreText: {
    color: colors.tactileMomentumSecondary,
    fontSize: ms(9),
    fontWeight: '700',
  },
});
