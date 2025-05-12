// src/shared/components/AnimatedBottomButton.tsx
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '../TextElement/TextElement';

export interface AnimatedBottomButtonProps {
  /** Button label */
  title: string;
  /** Press handler */
  onPress: (e: GestureResponderEvent) => void;
  /** Controls whether the button is visible (slides up) or hidden (slides down) */
  visible: boolean;
  /** Whether to show a loading spinner instead of the label */
  isLoading?: boolean;
  /** Called when the show/hide animation completes */
  onToggleComplete?: (visible: boolean) => void;
  /** Any additional container style overrides */
  style?: ViewStyle;
}

/**
 * AnimatedBottomButton slides up from the bottom when `visible` is true,
 * and slides down (with fade-out) when `visible` is false.
 *
 * @example
 * <AnimatedBottomButton
 *   title="Save"
 *   visible={isDirty}
 *   isLoading={saving}
 *   onPress={handleSave}
 * />
 */
export default function AnimatedBottomButton({
  title,
  onPress,
  visible,
  isLoading = false,
  onToggleComplete,
  style,
}: AnimatedBottomButtonProps) {
  const { colors, spacing, typography } = useTheme();

  // animated values
  const translateY = useRef(new Animated.Value(visible ? 0 : 100)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  // drive show/hide animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onToggleComplete?.(visible);
    });
  }, [visible, onToggleComplete, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          padding: spacing.md,
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, { width: '100%' }]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={{ paddingVertical: spacing.sm + 2 }}>
            <ActivityIndicator color={colors.onPrimary} />
          </View>
        ) : (
          <TextElement
            style={{ textAlign: 'center', paddingVertical: spacing.sm }}
            color="onPrimary"
            variant="body"
            weight="600"
          >
            {title}
          </TextElement>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // bottom of screen
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
  },
});
