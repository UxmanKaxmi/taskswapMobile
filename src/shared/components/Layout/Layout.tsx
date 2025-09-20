import React, { ReactNode, forwardRef } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  footerContent?: ReactNode;
  footerHeight?: number;
};

// ✅ forwardRef so parent can call scrollToEnd
const Layout = forwardRef<ScrollView, LayoutProps>(
  (
    {
      children = null,
      style = {},
      variant = 'auto',
      backgroundColor = colors.background,
      useSafeArea = true,
      statusBarHidden = false,
      scrollable = false,
      scrollViewProps = {},
      allowPadding = true,
      footerContent = null,
      footerHeight = 64,
      ...otherProps
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const Container = useSafeArea ? SafeAreaView : View;

    const content = scrollable ? (
      <ScrollView
        ref={ref} // 👈 expose ref here
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          allowPadding && styles.padded,
          { paddingBottom: footerContent ? insets.bottom : insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.flex, allowPadding && styles.padded]}>{children}</View>
    );

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.outerContainer, { backgroundColor }]}>
          <Container
            edges={['top', 'left', 'right']}
            style={[styles.container, allowPadding && styles.padded, style]}
            {...otherProps}
          >
            {content}

            {footerContent && (
              <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.sm }]}>
                {footerContent}
              </View>
            )}
          </Container>
        </View>
      </KeyboardAvoidingView>
    );
  },
);

export default Layout;

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
    paddingHorizontal: spacing.sm,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
