import { colors } from '@shared/theme';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  /**
   * Optional custom style for the border.
   */
  style?: ViewStyle;

  /**
   * Color of the border line. Defaults to light gray (#E0E0E0).
   */
  color?: string;

  /**
   * Thickness of the border line. Defaults to `StyleSheet.hairlineWidth`.
   */
  thickness?: number;

  /**
   * Whether the border is horizontal (true) or vertical (false). Defaults to true.
   */
  horizontal?: boolean;
};

/**
 * A simple border line component for vertical or horizontal dividers.
 *
 * @example
 * // Horizontal line
 * <AppBorder />
 *
 * @example
 * // Vertical line with custom color and spacing
 * <AppBorder horizontal={false} color="#000" style={{ marginHorizontal: 8 }} />
 */

export default function AppBorder({
  style,
  color = colors.border,
  thickness = StyleSheet.hairlineWidth,
  horizontal = true,
}: Props) {
  return (
    <View
      style={[
        horizontal ? { height: thickness, width: '100%' } : { width: thickness, height: '100%' },
        { backgroundColor: color },
        style,
      ]}
    />
  );
}
