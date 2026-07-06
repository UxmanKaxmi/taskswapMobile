import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { ThemeColors, useThemedStyles } from '@shared/theme';

type Props = {
  /** Large page title, e.g. "Friends" */
  title: string;
  /** Optional trailing accessory (e.g. an action button) */
  right?: ReactNode;
  /** Optional container style override (margins/padding per screen) */
  style?: StyleProp<ViewStyle>;
};

export default function PageHeader({ title, right, style }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, style]}>
      <TextElement style={styles.title} numberOfLines={1}>
        {title}
      </TextElement>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: vs(2),
    },
    title: {
      flexShrink: 1,
      fontSize: ms(25),
      lineHeight: ms(30),
      fontWeight: '800',
      letterSpacing: -0.4,
      color: colors.onboardingInk,
    },
    right: {
      marginLeft: ms(12),
    },
  });
