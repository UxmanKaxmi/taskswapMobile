import React from 'react';
import {
  Pressable,
  PressableProps,
  View,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';

type Props = {
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  rippleColor?: string;
  borderless?: boolean;
  radius?: number;
  disabled?: boolean;
  hitSlop?: PressableProps['hitSlop'];
};

export default function Ripple({
  onPress,
  children,
  style,
  rippleColor = 'rgba(0, 0, 0, 0.1)',
  borderless = false,
  radius,
  disabled = false,
  hitSlop,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      android_ripple={{
        color: rippleColor,
        borderless,
        radius,
      }}
      style={({ pressed }) => [
        radius != null && { borderRadius: radius },
        Platform.OS === 'ios' && pressed && !disabled && styles.iosRipple,
      ]}
    >
      <View
        style={[
          style, // 👈 NOW flexDirection: 'row' works!
          radius != null && { borderRadius: radius, overflow: 'hidden' },
        ]}
      >
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iosRipple: {
    opacity: 0.6,
  },
});
