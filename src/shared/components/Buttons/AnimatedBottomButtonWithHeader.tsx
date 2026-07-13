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
  type LayoutChangeEvent,
  type StyleProp,
} from 'react-native';
import Reanimated, { type AnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@shared/theme/useTheme';
import { platformShadow } from '@shared/theme';
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

  /** Text/spinner color of the button (defaults to onPrimary/white) */
  textColor?: string;

  /** Background color of the bottom sheet */
  containerColor?: string;

  style?: ViewStyle;

  /** Optional helper/header text above the button */
  buttonHeader?: string;

  embedded?: boolean;

  showButton?: boolean; // default true

  /** Optional ref + layout callback on the inner button, for measuring it
   * (e.g. as a shared-element morph target). Both are no-ops when omitted. */
  buttonRef?: React.Ref<any>;
  onButtonLayout?: (e: LayoutChangeEvent) => void;

  /** Skip the slide-up entrance and show immediately at the resting position.
   * Used while a shared-element morph flies the button in, so the measured
   * landing rect matches where the button actually rests. Pair with
   * `revealStyle` to sync the sheet's fade-in to the morph timeline. */
  entranceDisabled?: boolean;

  /** Reanimated style (typically the morph target's crossfade) applied around
   * the sheet, so its reveal runs on the same clock as the flying clone. */
  revealStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
}

const TEXT_ONLY_HEIGHT = vs(65);
const BUTTON_HEIGHT = vs(60);

export const BOTTOM_BUTTON_HEIGHT = isAndroid ? vs(90) : vs(120); // base (no header)

export default function AnimatedBottomButtonWithHeader({
  title,
  onPress,
  visible,
  isLoading = false,
  onToggleComplete,
  buttonColor,
  textColor,
  containerColor,
  style,
  buttonHeader,
  embedded = false,
  showButton = true,
  buttonRef,
  onButtonLayout,
  entranceDisabled = false,
  revealStyle,
}: AnimatedBottomButtonWithHeaderProps) {
  const { colors } = useTheme();
  const resolvedTextColor = textColor ?? colors.onPrimary;
  const hasButton = showButton !== false && !!title && !!onPress;
  const sheetMinHeight = hasButton
    ? buttonHeader
      ? BUTTON_HEIGHT
      : BOTTOM_BUTTON_HEIGHT
    : TEXT_ONLY_HEIGHT;
  const restingBottomOffset = 0;

  const translateY = useRef(new Animated.Value(embedded || entranceDisabled ? 0 : 120)).current;
  const opacity = useRef(new Animated.Value(embedded ? 1 : 0)).current;

  useEffect(() => {
    if (embedded) return;

    if (entranceDisabled) {
      // Shared-element morph in flight: hold the sheet at its resting position
      // (so the flying clone's measured landing spot is accurate) and show it
      // immediately — the morph-synced `revealStyle` is the only fade clock,
      // so the hand-off can't run on two competing timers.
      translateY.setValue(0);
      opacity.setValue(visible ? 1 : 0);
      onToggleComplete?.(visible);
      return;
    }

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
  }, [visible, entranceDisabled]);

  return (
    <Animated.View
      pointerEvents={embedded || visible ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        embedded && styles.embeddedWrapper,
        {
          transform: [{ translateY: embedded ? 0 : translateY }],
          opacity,
          bottom: embedded ? 0 : restingBottomOffset,
        },
        style,
      ]}
    >
      {/* Must stretch + center exactly like `wrapper`, or the sheet's
          percentage width collapses against a content-sized parent. */}
      <Reanimated.View style={[styles.revealWrap, revealStyle]}>
        <View
          style={[
            styles.sheet,
            styles.sheetElevated,
            {
              backgroundColor: containerColor ?? colors.card,
              minHeight: sheetMinHeight,
            },
          ]}
        >
          {buttonHeader && (
            <TextElement
              variant="subtitle"
              style={[styles.buttonHeader, !hasButton && styles.buttonHeaderOnly]}
              color="muted"
            >
              {buttonHeader}
            </TextElement>
          )}

          {hasButton && (
            <TouchableOpacity
              ref={buttonRef}
              onLayout={onButtonLayout}
              style={[styles.button, { backgroundColor: buttonColor ?? colors.primary }]}
              onPress={onPress}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={resolvedTextColor} />
              ) : (
                <TextElement weight="600" style={{ color: resolvedTextColor }}>
                  {title}
                </TextElement>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Reanimated.View>
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

  revealWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  sheet: {
    width: '105%',
    paddingTop: vs(16),
    paddingBottom: vs(24),
    paddingHorizontal: 16,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    ...platformShadow({
      color: '#000',
      opacity: 0.18,
      radius: 12,
      offset: { width: 0, height: -4 },
    }),
  },

  sheetElevated: {
    ...platformShadow({
      color: '#000',
      opacity: 0.34,
      radius: 24,
      offset: { width: 0, height: -10 },
    }),
  },

  buttonHeader: {
    fontSize: ms(14),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: vs(12),
    opacity: 0.85,
  },
  buttonHeaderOnly: {
    marginBottom: 0,
  },

  button: {
    height: vs(48),
    width: '90%',
    alignSelf: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
