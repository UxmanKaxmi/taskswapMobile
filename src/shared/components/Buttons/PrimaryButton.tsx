import { useTheme } from '@shared/theme/useTheme';
import ButtonBase from './ButtonBase';
import type { GestureResponderEvent, ViewStyle, TextStyle } from 'react-native';
import React from 'react';

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent | undefined) => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export default function PrimaryButton(props: Props) {
  const theme = useTheme();
  return <ButtonBase {...props} backgroundColor={theme.colors.primary} textColor="#fff" />;
}
