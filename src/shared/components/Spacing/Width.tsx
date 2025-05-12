// src/shared/components/Spacing/Width.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

export interface WidthProps {
  /**
   * Width in pixels. If omitted, uses theme.spacing.md by default.
   */
  size?: number;
  /**
   * Additional style overrides for the spacer container
   */
  style?: ViewStyle;
}

/**
 * A simple horizontal spacer component. Renders a View with the given width.
 * Useful for adding consistent horizontal gaps in your UI.
 *
 * @example
 * <View style={{ flexDirection: 'row' }}>
 *   <Text>Left</Text>
 *   <Width size={16} />
 *   <Text>Right</Text>
 * </View>
 */
export default function Width({ size, style }: WidthProps) {
  const { spacing } = useTheme();
  const width = size ?? spacing.md;
  return <View style={[{ width }, style]} />;
}
