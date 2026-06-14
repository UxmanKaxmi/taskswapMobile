import React, { useRef } from 'react';
import {
  Animated,
  Text,
  View,
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { moderateScale, ms, vs } from 'react-native-size-matters';
import { hexToRgba } from '@shared/utils/helperFunctions';
import { colors } from '@shared/theme';
import { resolveAppTextStyle } from '@shared/theme/fonts';

const AnimatedTouchable = Animated.createAnimatedComponent(Animated.View);
const BUTTON_RADIUS = ms(24);

type Props = {
  title: string;
  onPress: (event?: GestureResponderEvent) => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function ButtonBase({
  title,
  onPress,
  isLoading = false,
  icon,
  backgroundColor,
  textColor,
  borderColor = 'transparent',
  disabled = false,
  style,
  textStyle,
}: Props) {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const resolvedTextStyle = resolveAppTextStyle(
    [
      styles.text,
      { color: disabled ? '#888' : textColor },
      textStyle,
      isLoading && styles.hiddenText,
    ],
    { variant: 'label' },
  );

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(pressAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const bgColor = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      disabled ? '#ccc' : backgroundColor,
      disabled
        ? '#bbb'
        : backgroundColor === 'transparent'
          ? hexToRgba(borderColor ?? colors.primary, 0.08) // 👈 light pressed tint
          : shadeColor(backgroundColor, -20),
    ],
  });

  return (
    <AnimatedTouchable
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: disabled ? '#ccc' : borderColor,
        },
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
      onTouchMove={handlePressOut}
      onStartShouldSetResponder={() => true}
      onResponderRelease={e => {
        handlePressOut();
        e.stopPropagation(); // ✅ prevents nested press event leak
        if (!isLoading && !disabled) onPress(e);
      }}
      pointerEvents={isLoading || disabled ? 'none' : 'auto'}
    >
      <View style={styles.content}>
        {icon && <View style={[styles.iconWrapper, isLoading && styles.hiddenIcon]}>{icon}</View>}

        <Text style={resolvedTextStyle}>{title}</Text>

        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size={10} color={textColor} />
          </View>
        )}
      </View>
    </AnimatedTouchable>
  );
}

function shadeColor(color: string, amount: number) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(color.trim());

  if (!match) {
    return color;
  }

  let hex = match[1];

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }

  const rgbHex = hex.slice(0, 6);
  const r = clampColorChannel(parseInt(rgbHex.slice(0, 2), 16) + amount);
  const g = clampColorChannel(parseInt(rgbHex.slice(2, 4), 16) + amount);
  const b = clampColorChannel(parseInt(rgbHex.slice(4, 6), 16) + amount);

  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

function clampColorChannel(value: number) {
  return Math.max(0, Math.min(255, value));
}

function toHexChannel(value: number) {
  return value.toString(16).padStart(2, '0');
}

const styles = StyleSheet.create({
  hiddenIcon: {
    opacity: 0,
  },
  hiddenText: {
    opacity: 0,
  },

  loaderOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center', // 👈 Add this
    justifyContent: 'center', // 👈 Ensure centered
    paddingVertical: moderateScale(16), // 👈 Optional tweak
    paddingHorizontal: moderateScale(24),
    borderRadius: BUTTON_RADIUS,
    borderWidth: 1,
    marginVertical: vs(10),
    marginHorizontal: moderateScale(6),
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center', // 👈 Crucial for vertical centering
    justifyContent: 'center',
  },
  text: {
    fontSize: moderateScale(16), // 👈 Slightly smaller may help
    fontWeight: '700', // 👈 Optional tweak for balance
  },
  iconWrapper: {
    marginRight: 8,
  },
});
