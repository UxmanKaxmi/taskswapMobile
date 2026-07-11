import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { ThemeColors, platformShadow, useThemedStyles } from '@shared/theme';

export type PushToastProps = {
  pusherName: string;
  message?: string;
  // When provided, the pill becomes tappable (e.g. to open the goal detail).
  onPress?: () => void;
};

export default function PushToast({
  pusherName,
  message = 'just pushed you forward',
  onPress,
}: PushToastProps) {
  const styles = useThemedStyles(createStyles);

  const pill = (
    <View style={styles.pill}>
      <TextElement variant="bodySmall" weight="700" style={styles.message}>
        <Text style={styles.name}>{pusherName}</Text>
        <Text style={styles.messageRest}> {message}</Text>
      </TextElement>
    </View>
  );

  if (!onPress) {
    return <View style={styles.wrap}>{pill}</View>;
  }

  return (
    <Pressable
      style={styles.wrap}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pusherName} ${message}. Open goal.`}
    >
      {pill}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: ms(12),
      gap: ms(10),
      // width: '100%',
    },

    pill: {
      // flex: 1,
      // minHeight: vs(56),
      borderRadius: 999,
      backgroundColor: colors.inkSurface,
      justifyContent: 'center',
      paddingHorizontal: ms(20),
      paddingVertical: vs(11),
      ...platformShadow({
        color: 'rgba(0, 0, 0, 0.26)',
        opacity: 1,
        radius: 14,
        offset: { width: 0, height: 6 },
      }),
    },
    message: {
      color: colors.onPrimary,
      fontSize: ms(15),
      lineHeight: ms(18),
      textAlign: 'left',
    },
    name: {
      color: colors.onboardingPush,
      fontWeight: '900',
    },
    messageRest: {
      color: colors.onPrimary,
      fontWeight: '900',
    },
  });
