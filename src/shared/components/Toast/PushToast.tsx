import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { ThemeColors, platformShadow, useThemedStyles } from '@shared/theme';

export type PushToastProps = {
  pusherName: string;
  message?: string;
};

export default function PushToast({
  pusherName,
  message = 'just pushed you forward',
}: PushToastProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrap}>
      {/* <View style={styles.avatar}></View> */}

      <View style={styles.pill}>
        <TextElement variant="bodySmall" weight="700" style={styles.message}>
          <Text style={styles.name}>{pusherName}</Text>
          <Text style={styles.messageRest}> {message}</Text>
        </TextElement>
      </View>
    </View>
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
