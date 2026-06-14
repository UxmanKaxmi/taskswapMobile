import { useTheme } from '@shared/theme/useTheme';
import ButtonBase from './ButtonBase';
import type { GestureResponderEvent, StyleProp, ViewStyle, TextStyle } from 'react-native';
import React from 'react';

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent | undefined) => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

export default function PrimaryButton({ backgroundColor, textColor, ...props }: Props) {
  const theme = useTheme();
  return (
    <ButtonBase
      {...props}
      backgroundColor={backgroundColor ?? theme.colors.primary}
      textColor={textColor ?? '#fff'}
    />
  );
}
