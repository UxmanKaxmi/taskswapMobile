import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

type Props = {
  children: ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: ViewStyle;
  flex?: boolean | number;
  fullWidth?: boolean;
};

/**
 * A flexible vertical layout component.
 * @example
 * <Column gap={16} fullWidth>
 *   <Text>Label</Text>
 *   <TextInput />
 * </Column>
 */
export default function Column({
  children,
  gap = 0,
  align = 'flex-start', // ✅ default for form alignment
  justify = 'flex-start',
  style,
  flex = false,
  fullWidth = false,
}: Props) {
  const theme = useTheme();

  const dynamicStyles: ViewStyle = {
    gap: gap || theme.spacing.sm,
    alignItems: align,
    justifyContent: justify,
    flex: typeof flex === 'boolean' ? (flex ? 1 : 0) : flex,
    ...(fullWidth && { width: '100%', alignSelf: 'stretch' }),
  };

  return <View style={[styles.column, dynamicStyles, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
  },
});
