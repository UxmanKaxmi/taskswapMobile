// src/shared/components/Buttons/OutlineButton.tsx
import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';
import ButtonBase from '@shared/components/Buttons/ButtonBase';

export interface OutlineButtonProps {
  /** Button text */
  title: string;
  /** onPress handler */
  onPress: () => void;
  /** Loading indicator */
  isLoading?: boolean;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Disable interaction */
  disabled?: boolean;
  /** Optional override for the outline border color */
  borderColor?: string;
  /** Optional override for the button background color */
  backgroundColor?: string;
  /** Optional override for the text color */
  textColor?: string;
  /** Variant: 'default' for transparent outline, 'alt' for filled */
  type?: 'default' | 'alt';
  /** Override container style */
  style?: ViewStyle;
  /** Override text style */
  textStyle?: TextStyle;
}

/**
 * OutlineButton: transparent outline button or filled variant
 */
export default function OutlineButton({
  title,
  onPress,
  isLoading = false,
  icon,
  disabled = false,
  borderColor,
  backgroundColor,
  textColor,
  type = 'default',
  style,
  textStyle,
}: OutlineButtonProps) {
  const { colors, typography } = useTheme();

  const resolvedBorderColor = disabled
    ? colors.muted
    : (borderColor ?? (type === 'alt' ? colors.primary : colors.primary));

  const resolvedTextColor = disabled
    ? colors.muted
    : (textColor ?? (type === 'alt' ? colors.onPrimary : colors.primary));

  const bgColor = backgroundColor ?? (type === 'alt' ? colors.primary : 'transparent');

  return (
    <ButtonBase
      title={title}
      onPress={onPress}
      isLoading={isLoading}
      disabled={disabled}
      icon={icon}
      backgroundColor={bgColor}
      textColor={resolvedTextColor}
      borderColor={resolvedBorderColor}
      style={style}
      textStyle={[{ fontSize: typography.body }, textStyle]}
    />
  );
}
