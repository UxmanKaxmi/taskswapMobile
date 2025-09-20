import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

type Props = {
  /** Child components to display inside the row */
  children: ReactNode;
  /** Spacing between children */
  gap?: number;
  /** Horizontal alignment of children */
  align?: ViewStyle['alignItems'];
  /** Main-axis distribution of children */
  justify?: ViewStyle['justifyContent'];
  /** Custom styles to override or extend the row */
  style?: ViewStyle;
  /** Flex value to apply to the row container */
  flex?: boolean | number;
  /** Whether the row should take full width */
  fullWidth?: boolean;
};

/**
 * A flexible horizontal layout component.
 *
 * Provides an easy way to arrange children in a row with spacing,
 * alignment, justification, and optional flex behavior.
 *
 * @example
 * <Row gap={12} justify="space-between">
 *   <Text>Left</Text>
 *   <Text>Right</Text>
 * </Row>
 */
export default function Row({
  children,
  gap = 0,
  align = 'center',
  justify = 'center',
  style,
  flex = false,
  fullWidth = false,
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,

        {
          gap: gap || theme.spacing.sm,
          alignItems: align,
          justifyContent: justify,
          flex: typeof flex === 'boolean' ? (flex ? 1 : 0) : flex,
          ...(fullWidth && { width: '100%', alignSelf: 'stretch' }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
