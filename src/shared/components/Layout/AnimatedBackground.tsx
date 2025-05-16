// components/AnimatedBackground.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Wrap the gradient so we can feed it Animated values
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const { width, height } = Dimensions.get('window');

import { ReactNode } from 'react';

export default function AnimatedBackground({ children }: { children: ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loop 0 → 1 → 0
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [progress]);

  // Animate the “stop” point between 0 and 1
  const stop = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // locations must match the length of your colors array
  const locations = [stop, Animated.subtract(1, stop)];

  return (
    <AnimatedGradient
      // ➊ static colors
      colors={['#fff', '#ffff']}
      // ➋ animated stop positions
      locations={locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {children}
    </AnimatedGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    width,
    height,
  },
});
