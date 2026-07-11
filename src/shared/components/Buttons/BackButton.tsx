import React from 'react';
import { GestureResponderEvent, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { ms } from 'react-native-size-matters';

import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import Icon from '@shared/components/Icons/Icon';
import Ripple from './Ripple';

type Props = {
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function BackButton({ onPress, style, disabled = false }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Ripple
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      radius={ms(21)}
      hitSlop={ms(6)}
    >
      <Icon set="ion" name="chevron-back" size={22} color={colors.onboardingInk} />
    </Ripple>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: ms(42),
      height: ms(42),
      borderRadius: ms(21),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
    },
  });
