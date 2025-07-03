// src/shared/components/Layout.tsx

import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@shared/theme/useTheme';
import AnimatedBackground from './AnimatedBackground';

type Props = {
  children: ReactNode;
  centered?: boolean;
  style?: ViewStyle;
  allowPadding?: boolean;
  edges?: Edge[]; // configurable safe area edges
};

export default function Layout({
  children,
  centered = false,
  style,
  allowPadding = true,
  edges = ['top', 'right', 'left'], // default safe-area edges
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: allowPadding ? theme.spacing.sm : 0,
    paddingTop: allowPadding ? theme.spacing.md : 0,
    justifyContent: centered ? 'center' : 'flex-start',
    alignItems: centered ? 'center' : 'flex-start',
  };

  return (
    <View style={containerStyle}>
      <SafeAreaView edges={edges} style={[containerStyle, style]}>
        {/* <AnimatedBackground> */}
        {children}
        {/* </AnimatedBackground> */}
      </SafeAreaView>
    </View>
  );
}
