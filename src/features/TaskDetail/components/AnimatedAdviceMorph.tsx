// src/shared/components/Advice/AnimatedAdviceMorph.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import AnimatedBottomButtonWithHeader from '@shared/components/Buttons/AnimatedBottomButtonWithHeader';
import AnimatedBottomComposer, { COMPOSER_HEIGHT } from './AnimatedBottomComposer';
import { colors } from '@shared/theme';
import { BOTTOM_BUTTON_HEIGHT } from '@shared/components/Buttons/AnimatedBottomButton';
import { vs } from 'react-native-size-matters';

const BUTTON_HEIGHT = BOTTOM_BUTTON_HEIGHT + 20; // header height

export default function AnimatedAdviceMorph({
  progress,
  adviceText,
  onChangeText,
  onSubmit,
  autoFocus,
  onOpenComposer,
}) {
  const containerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(progress.value, [0, 1], [BUTTON_HEIGHT, COMPOSER_HEIGHT]),
      borderRadius: interpolate(progress.value, [0, 1], [24, 40]),

      // 👇 THIS IS THE KEY FIX
      bottom: interpolate(
        progress.value,
        [0, 1],
        [-35, -20], // button floats, composer sticks
      ),
    };
  });

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4], [1, 0]),
    transform: [
      {
        scale: interpolate(progress.value, [0, 0.4], [1, 0.96]),
      },
    ],
  }));

  const composerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.4, 1], [0, 1]),
    transform: [
      {
        translateY: interpolate(progress.value, [0.4, 1], [20, 0]),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          //   bottom: onOpenComposer ? -vs(25) : -vs(0),
        },
      ]}
    >
      {/* BUTTON */}
      <Animated.View style={[StyleSheet.absoluteFill, buttonStyle]}>
        <AnimatedBottomButtonWithHeader
          embedded
          visible
          title="💡 Share advice"
          buttonHeader="Your experience could really help here."
          buttonColor={colors.adviceBgHardest}
          containerColor={colors.onPrimary}
          onPress={onOpenComposer}
        />
      </Animated.View>

      {/* COMPOSER */}
      <Animated.View style={[StyleSheet.absoluteFill, composerStyle]}>
        <AnimatedBottomComposer
          visible
          autoFocus={autoFocus}
          value={adviceText}
          onChangeText={onChangeText}
          onSubmit={onSubmit}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // overflow: 'hidden',
    // bottom: -vs(25),
  },
});
