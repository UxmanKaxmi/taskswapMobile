import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import { colors } from '@shared/theme';
import { TaskType } from '@features/Tasks/types/tasks';
import ButtonBase from '../Buttons/ButtonBase';

interface PushButtonProps {
  onPress: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  taskType?: TaskType;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
  textStyle?: TextStyle;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export default function PushButton({
  onPress,
  label = 'Push',
  size = 'sm',
  taskType,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  backgroundColor,
  textColor = colors.onPrimary,
  borderColor = 'transparent',
}: PushButtonProps) {
  const resolvedBg = backgroundColor ?? colors[`${taskType || 'reminder'}BgHardest`];

  const sizeStyles = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large,
  };

  const textSizeStyles = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  };
  return (
    <ButtonBase
      title={label}
      onPress={onPress}
      isLoading={loading}
      disabled={disabled}
      icon={icon}
      backgroundColor={resolvedBg}
      textColor={textColor}
      borderColor={borderColor}
      style={StyleSheet.flatten([sizeStyles[size], style])}
      textStyle={StyleSheet.flatten([textSizeStyles[size], textStyle])}
    />
  );
}
const styles = StyleSheet.create({
  /* Button sizes */
  small: {
    paddingVertical: vs(6),
    paddingHorizontal: ms(12),
    borderRadius: ms(20),
    alignSelf: 'flex-start',
    marginVertical: 0,
    marginHorizontal: 0,
  },
  medium: {
    paddingVertical: vs(10),
    paddingHorizontal: ms(18),
    borderRadius: ms(22),
  },
  large: {
    paddingVertical: vs(14),
    paddingHorizontal: ms(24),
    borderRadius: ms(26),
  },

  /* Text sizes */
  textSm: {
    fontSize: ms(12),
    fontWeight: '600',
  },
  textMd: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  textLg: {
    fontSize: ms(16),
    fontWeight: '700',
  },
});
