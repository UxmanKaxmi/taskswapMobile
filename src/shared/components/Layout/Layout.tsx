import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

type Props = {
  children: ReactNode;
  safe?: boolean;
  centered?: boolean;
  style?: ViewStyle;
};

/**
 * Layout component that provides a consistent structure for the application.
 * It supports optional safe area handling and content centering.
 *
 * @param {object} props - The props for the Layout component.
 * @param {React.ReactNode} props.children - The content to be rendered inside the layout.
 * @param {boolean} [props.safe=true] - Determines whether to use a `SafeAreaView` to handle safe areas.
 * @param {boolean} [props.centered=false] - If true, centers the content both vertically and horizontally.
 * @param {ViewStyle} [props.style] - Optional additional styles to override or extend the container.
 *
 * @returns {JSX.Element} The rendered layout component.
 */
export default function Layout({ children, safe = true, centered = false, style }: Props) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingTop: safe || centered ? theme.spacing.lg : 0,
      justifyContent: centered ? 'center' : 'flex-start',
      alignItems: centered ? 'center' : 'flex-start',
    },
  });

  const Wrapper = safe ? SafeAreaView : View;

  return <Wrapper style={[styles.container, style]}>{children}</Wrapper>;
}