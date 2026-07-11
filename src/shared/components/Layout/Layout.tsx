import React, { ReactNode, forwardRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
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

const ANDROID_KEYBOARD_FOOTER_GAP = vs(24);

// ✅ forwardRef so parent can call scrollToEnd
const Layout = forwardRef<ScrollView, LayoutProps>(
  (
    {
      children = null,
      style = {},
      variant = 'auto',
      backgroundColor,
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
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const resolvedBackgroundColor = backgroundColor ?? colors.onboardingPaper;
    const insets = useSafeAreaInsets();
    const Container = useSafeArea ? SafeAreaView : View;
    const androidApiVersion =
      typeof Platform.Version === 'number' ? Platform.Version : Number(Platform.Version);
    const shouldUseAndroidTopSafeArea = isAndroid && androidApiVersion >= 35;
    const shouldLiftAndroidFooter = isAndroid && androidApiVersion >= 35;
    const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);
    const edges = useSafeArea
      ? isIOS
        ? (['top', 'left', 'right'] as const)
        : shouldUseAndroidTopSafeArea
          ? (['top', 'left', 'right'] as const)
          : (['left', 'right'] as const)
      : [];
    const finalEdges: Array<'top' | 'bottom' | 'left' | 'right'> =
      Array.isArray(edgesProp) && edgesProp.length > 0 ? edgesProp : [...edges];
    const footerBottomInset = insets.bottom || spacing.sm;
    const {
      contentContainerStyle: scrollContentContainerStyle,
      style: scrollStyle,
      ...restScrollViewProps
    } = (scrollViewProps as any) ?? {};
    const androidFooterKeyboardLift =
      shouldLiftAndroidFooter && androidKeyboardHeight > 0
        ? androidKeyboardHeight + ANDROID_KEYBOARD_FOOTER_GAP
        : 0;

    useEffect(() => {
      if (!shouldLiftAndroidFooter) return undefined;

      const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
        setAndroidKeyboardHeight(event.endCoordinates.height);
      });
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setAndroidKeyboardHeight(0);
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [shouldLiftAndroidFooter]);

    const content = scrollable ? (
      <ScrollView
        ref={ref} // 👈 expose ref here
        style={[styles.flex, scrollStyle]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          allowPaddingVertical && styles.paddedVertical,
          allowPaddingHorizontal && styles.paddedHorizontal,
          footerContent ? { paddingBottom: footerHeight + footerBottomInset } : null,
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
        <View style={[styles.outerContainer, { backgroundColor: resolvedBackgroundColor }]}>
          <Container
            edges={finalEdges}
            style={[styles.container, allowPaddingVertical && styles.paddedVertical, style]}
            {...otherProps}
          >
            {content}

            {footerContent && (
              <View
                style={[
                  styles.footer,
                  {
                    paddingBottom: footerBottomInset,
                    transform: [{ translateY: -androidFooterKeyboardLift }],
                  },
                ]}
              >
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor: colors.onboardingPaper,
    },
    container: {
      flexGrow: 1, // ✅ instead of flex:1
    },
    paddedVertical: {
      paddingVertical: isAndroid ? vs(5) : 0,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
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
