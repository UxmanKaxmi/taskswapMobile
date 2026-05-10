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
  type = 'default',
  style,
  textStyle,
}: OutlineButtonProps) {
  const { colors, typography } = useTheme();

  const borderColor = disabled ? colors.muted : type === 'alt' ? colors.primary : colors.primary;

  const textColor = disabled ? colors.muted : type === 'alt' ? colors.onPrimary : colors.primary;

  const bgColor = type === 'alt' ? colors.primary : 'transparent';

  return (
    <ButtonBase
      title={title}
      onPress={onPress}
      isLoading={isLoading}
      disabled={disabled}
      icon={icon}
      backgroundColor={bgColor}
      textColor={textColor}
      borderColor={borderColor}
      style={style}
      textStyle={[{ fontSize: typography.body }, textStyle]}
    />
  );
}
