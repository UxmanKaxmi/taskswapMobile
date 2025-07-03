import React, { ReactNode } from 'react';
import { View, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@shared/theme';
import { isAndroid } from '@shared/utils/constants';

type LayoutProps = {
  children?: ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  useSafeArea?: boolean;
  statusBarHidden?: boolean;
  scrollable?: boolean;
  scrollViewProps?: object;
  allowPadding?: boolean;
};

export default function Layout({
  children = null,
  style = {},
  variant = 'auto',
  backgroundColor = colors.background,
  useSafeArea = true,
  statusBarHidden = false,
  scrollable = false,
  scrollViewProps = {},
  allowPadding = true,
  ...otherProps
}: LayoutProps) {
  const insets = useSafeAreaInsets();
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <View style={[styles.outerContainer, { backgroundColor }]}>
      {/* <StatusBar
        barStyle={variant === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        hidden={statusBarHidden}
        translucent
      /> */}

      <Container
        edges={['top', 'left', 'right', 'top']}
        style={[styles.container, allowPadding && styles.padded, style]}
        {...otherProps}
      >
        {children}
      </Container>

      {/* {insets.bottom > 0 && <View style={{ height: insets.bottom, backgroundColor }} />} */}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    // paddingTop: isAndroid ? spacing.md : 0,
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingVertical: isAndroid ? spacing.md : 0,
    paddingHorizontal: spacing.md,
  },
});
