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
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '../TextElement/TextElement';
import { ms, vs } from 'react-native-size-matters';
import { isAndroid } from '@shared/utils/constants';

export interface AnimatedBottomButtonWithHeaderProps {
  title?: string;
  onPress?: (e: GestureResponderEvent) => void;
  visible: boolean;
  isLoading?: boolean;
  onToggleComplete?: (visible: boolean) => void;

  /** Background color of the button */
  buttonColor?: string;

  /** Background color of the bottom sheet */
  containerColor?: string;

  style?: ViewStyle;

  /** Optional helper/header text above the button */
  buttonHeader?: string;

  embedded?: boolean;

  showButton?: boolean; // default true
}

const HEADER_HEIGHT = vs(60);
const TEXT_ONLY_HEIGHT = vs(65);
const BUTTON_HEIGHT = vs(120);

export const BOTTOM_BUTTON_HEIGHT = isAndroid ? vs(90) : vs(120); // base (no header)

export default function AnimatedBottomButtonWithHeader({
  title,
  onPress,
  visible,
  isLoading = false,
  onToggleComplete,
  buttonColor,
  containerColor,
  style,
  buttonHeader,
  embedded = false,
  showButton = true,
}: AnimatedBottomButtonWithHeaderProps) {
  const { colors } = useTheme();

  const translateY = useRef(new Animated.Value(embedded ? 0 : 120)).current;
  const opacity = useRef(new Animated.Value(embedded ? 1 : 0)).current;

  useEffect(() => {
    if (embedded) return;

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
      pointerEvents={embedded || visible ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        embedded && styles.embeddedWrapper,
        {
          transform: [{ translateY: embedded ? 0 : translateY }],
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
        {buttonHeader && (
          <TextElement style={styles.buttonHeader} color="muted">
            {buttonHeader}
          </TextElement>
        )}

        {showButton !== false && title && onPress && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor ?? colors.primary }]}
            onPress={onPress}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <TextElement color="onPrimary" weight="600">
                {title}
              </TextElement>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },

  embeddedWrapper: {
    position: 'relative',
  },

  sheet: {
    width: '105%',
    paddingTop: vs(16),
    paddingBottom: vs(24),
    paddingHorizontal: 16,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 14,
  },

  buttonHeader: {
    fontSize: ms(16),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: vs(12),
    opacity: 0.85,
  },

  button: {
    height: vs(48),
    width: '95%',
    alignSelf: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
