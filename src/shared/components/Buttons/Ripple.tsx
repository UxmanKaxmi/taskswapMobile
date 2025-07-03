import React from 'react';
import {
  Pressable,
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
};

export default function Ripple({
  onPress,
  children,
  style,
  rippleColor = 'rgba(0, 0, 0, 0.1)',
  borderless = false,
  radius,
  disabled = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{
        color: rippleColor,
        borderless,
        radius,
      }}
      style={({ pressed }) => [
        style,
        radius != null && { borderRadius: radius },
        Platform.OS === 'ios' && pressed && !disabled && styles.iosRipple,
      ]}
    >
      <View style={radius != null ? { borderRadius: radius, overflow: 'hidden' } : undefined}>
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
