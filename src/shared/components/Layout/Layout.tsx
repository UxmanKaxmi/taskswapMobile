// src/shared/components/Layout.tsx
import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shared/theme/useTheme';

type Props = {
  children: ReactNode;
  centered?: boolean;
  style?: ViewStyle;
};

export default function Layout({ children, centered = false, style }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Compose a container style that:
  // • Respects the top & bottom safe-area insets
  // • Always applies horizontal padding from the theme
  // • Optionally centers content
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    justifyContent: centered ? 'center' : 'flex-start',
    alignItems: centered ? 'center' : 'flex-start',
  };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={[containerStyle, style]}>
      {children}
    </SafeAreaView>
  );
}
