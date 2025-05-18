// src/shared/components/animated/AnimatedCard.tsx

import React, { useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export default function AnimatedCard({ children, style, onPress }: AnimatedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
    if (onPress) onPress();
  };

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, styles.card, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
