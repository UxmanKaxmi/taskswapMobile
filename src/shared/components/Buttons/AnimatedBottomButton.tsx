// src/shared/components/Buttons/AnimatedBottomButton.tsx
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '../TextElement/TextElement';
import { vs } from 'react-native-size-matters';
import { isIOS } from '@shared/utils/constants';

export interface AnimatedBottomButtonProps {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  visible: boolean;
  isLoading?: boolean;
  onToggleComplete?: (visible: boolean) => void;

  /** Background color of the button */
  buttonColor?: string;

  /** Background color of the bottom sheet */
  containerColor?: string;

  style?: ViewStyle;
}

export const BOTTOM_BUTTON_HEIGHT = vs(105);

export default function AnimatedBottomButton({
  title,
  onPress,
  visible,
  isLoading = false,
  onToggleComplete,
  buttonColor,
  containerColor,
  style,
}: AnimatedBottomButtonProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(visible ? 0 : BOTTOM_BUTTON_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 120,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onToggleComplete?.(visible));
  }, [visible]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: containerColor ?? colors.card,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor ?? colors.primary }]}
          onPress={onPress}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <TextElement
              color="onPrimary"
              variant="body"
              weight="600"
              style={{ textAlign: 'center' }}
            >
              {title}
            </TextElement>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -20, // ✅ ALWAYS 0
    alignItems: 'center',
  },
  sheet: {
    width: '105%', // ✅ FULL WIDTH
    paddingHorizontal: 16, // inset content
    paddingVertical: vs(20),
    borderTopEndRadius: 28,
    borderTopStartRadius: 28,

    // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },

    // Android shadow
    height: BOTTOM_BUTTON_HEIGHT,

    elevation: 14,
  },

  button: {
    height: vs(45),
    width: '100%',
    alignSelf: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
