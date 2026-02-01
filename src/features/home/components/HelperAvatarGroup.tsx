import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { TaskHelper } from '../types/home';
import TextElement from '@shared/components/TextElement/TextElement';
import { ms } from 'react-native-size-matters';
import { colors } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow';

type Props = {
  helpers: TaskHelper[];
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
        <Image
          source={helper.photo ? { uri: helper.photo } : require('@assets/images/emptyFriend.png')}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
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

  avatar: {
    borderWidth: 0.4,
    borderColor: colors.card,
    backgroundColor: colors.muted,
    opacity: 0.9,
  },

  more: {
    backgroundColor: colors.onAccent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },

  moreText: {
    color: colors.muted,
    fontSize: ms(10),
    fontWeight: '500',
  },
});
