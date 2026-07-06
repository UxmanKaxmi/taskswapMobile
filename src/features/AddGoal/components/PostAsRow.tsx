import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { spacing, type ThemeColors, useThemedStyles, useTheme } from '@shared/theme';

type Props = {
  userName: string;
  isAnonymous: boolean;
  onToggle: () => void;
};

// The quiet per-goal identity control: "Posting as Usman K. · Post anonymously".
// It earns composer real estate because it's the one decision that can't be
// safely changed after posting.
export default function PostAsRow({ userName, isAnonymous, onToggle }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.block}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={
          isAnonymous ? 'Posting anonymously. Switch to your name.' : 'Post anonymously'
        }
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <Icon
          set="fa6"
          name={isAnonymous ? 'user-secret' : 'circle-user'}
          iconStyle="solid"
          size={15}
          color={colors.onboardingMuted ?? colors.muted}
          style={styles.icon}
        />

        <TextElement variant="bodySmall" color="muted" style={styles.currentIdentity}>
          {isAnonymous ? 'Posting anonymously' : `Posting as ${userName}`}
        </TextElement>

        <TextElement variant="bodySmall" weight="700" style={styles.action}>
          {isAnonymous ? 'Use my name' : 'Post anonymously'}
        </TextElement>
      </Pressable>

      {isAnonymous ? (
        <TextElement variant="caption" color="muted" style={styles.hint}>
          You'll get a generated alias. Nobody sees your name or profile.
        </TextElement>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    block: {
      marginTop: vs(18),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: vs(6),
    },
    rowPressed: {
      opacity: 0.6,
    },
    icon: {
      marginRight: ms(8),
    },
    currentIdentity: {
      flex: 1,
      fontSize: ms(13),
    },
    action: {
      fontSize: ms(13),
      color: colors.onboardingInk,
      textDecorationLine: 'underline',
    },
    hint: {
      marginTop: vs(2),
      marginLeft: ms(23),
      fontSize: ms(11.5),
      lineHeight: ms(15),
    },
  });
