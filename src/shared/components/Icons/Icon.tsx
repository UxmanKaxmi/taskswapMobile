import React from 'react';
import { ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6'; // Correct casing for import

type IconProps = {
  name: string; // ✅ free typing (e.g. 'circle-check', 'xmark') // spell-checker: disable-line
  size?: number;
  color?: string;
  variant?: 'primary' | 'accent' | 'success' | 'error' | 'text';
  style?: ViewStyle;
  iconStyle?: 'solid' | 'regular' | 'brand'; // ✅ optional, default is 'regular'
};

/**
 * Central Icon wrapper using FontAwesome6 with theme variant support.
 */
export default function Icon({
  name, // Now used in the component
  size = 24,
  color,
  variant = 'text',
  style,
  iconStyle = 'regular',
}: IconProps) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors[variant];

  return (
    <FontAwesome6
      name={name as any}
      size={size}
      iconStyle={iconStyle}
      color={iconColor}
      style={style}
    /> // Updated to use 'type' instead of 'iconStyle'
  );
}
