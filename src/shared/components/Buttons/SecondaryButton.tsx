import { useTheme } from '@shared/theme/useTheme';
import ButtonBase from './ButtonBase';
import type { GestureResponderEvent, ViewStyle, TextStyle } from 'react-native';
import React from 'react';

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export default function SecondaryButton(props: Props) {
  const theme = useTheme();
  return (
    <ButtonBase
      {...props}
      backgroundColor={theme.colors.background}
      textColor={theme.colors.primary}
      borderColor={theme.colors.primary}
    />
  );
}
