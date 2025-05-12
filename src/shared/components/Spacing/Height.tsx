// src/shared/components/Spacing/Height.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

export interface HeightProps {
  /**
   * Height in pixels. If omitted, uses theme.spacing.md by default.
   */
  size?: number;
  /**
   * Additional style overrides for the spacer container
   */
  style?: ViewStyle;
}

/**
 * A simple vertical spacer component. Renders a View with the given height.
 * Useful for adding consistent vertical gaps in your UI.
 *
 * @example
 * <View>
 *   <Text>Above</Text>
 *   <Height size={16} />
 *   <Text>Below</Text>
 * </View>
 */
export default function Height({ size, style }: HeightProps) {
  const { spacing } = useTheme();
  const height = size ?? spacing.md;
  return <View style={[{ height }, style]} />;
}
