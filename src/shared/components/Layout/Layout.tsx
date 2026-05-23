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
import { isAndroid, isIOS } from '@shared/utils/constants';
import { vs } from 'react-native-size-matters';

type LayoutProps = {
  children?: ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  useSafeArea?: boolean;
  statusBarHidden?: boolean;
  scrollable?: boolean;
  scrollViewProps?: object;
  allowPaddingVertical?: boolean;
  allowPaddingHorizontal?: boolean;

  footerContent?: ReactNode;
  footerHeight?: number;
  edgesProp?: Array<'top' | 'bottom' | 'left' | 'right'>;
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
      allowPaddingVertical = true,
      allowPaddingHorizontal = true,
      footerContent = null,
      footerHeight = 64,
      edgesProp = [],
      ...otherProps
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const Container = useSafeArea ? SafeAreaView : View;
    const edges = useSafeArea
      ? isIOS
        ? (['top', 'left', 'right'] as const)
        : (['left', 'right'] as const)
      : [];
    const finalEdges: Array<'top' | 'bottom' | 'left' | 'right'> =
      Array.isArray(edgesProp) && edgesProp.length > 0 ? edgesProp : [...edges];
    const hasBottomSafeEdge = finalEdges.includes('bottom');
    const footerBottomInset = hasBottomSafeEdge ? 0 : insets.bottom || spacing.sm;
    const {
      contentContainerStyle: scrollContentContainerStyle,
      style: scrollStyle,
      ...restScrollViewProps
    } = (scrollViewProps as any) ?? {};

    const content = scrollable ? (
      <ScrollView
        ref={ref} // 👈 expose ref here
        style={[styles.flex, scrollStyle]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          allowPaddingVertical && styles.paddedVertical,
          allowPaddingHorizontal && styles.paddedHorizontal,
          footerContent
            ? { paddingBottom: footerHeight + (hasBottomSafeEdge ? 0 : insets.bottom) }
            : null,
          scrollContentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        {...restScrollViewProps}
      >
        {children}
      </ScrollView>
    ) : (
      <View
        style={[
          styles.flex,
          allowPaddingVertical && styles.paddedVertical,
          allowPaddingHorizontal && styles.paddedHorizontal,
        ]}
      >
        {children}
      </View>
    );

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.outerContainer, { backgroundColor }]}>
          <Container
            edges={finalEdges}
            style={[styles.container, allowPaddingVertical && styles.paddedVertical, style]}
            {...otherProps}
          >
            {content}

            {footerContent && (
              <View style={[styles.footer, { paddingBottom: footerBottomInset }]}>
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
    flexGrow: 1, // ✅ instead of flex:1
  },
  paddedVertical: {
    paddingVertical: isAndroid ? vs(5) : 0,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.transparent,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  paddedHorizontal: {
    paddingHorizontal: spacing.md, // ✅ HERE
  },
});
