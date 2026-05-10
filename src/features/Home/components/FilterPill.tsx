import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function FilterPill({ label, active, onPress }: Props) {
  return (
    <AnimatedPressable onPress={onPress} style={[styles.pill, active && styles.activePill]}>
      <TextElement style={[styles.label, active && styles.activeLabel]}>{label}</TextElement>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: ms(18),
    paddingVertical: vs(3),
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activePill: {
    backgroundColor: colors.tabActive, // ✅ black
    borderColor: colors.tabActive,
  },
  label: {
    fontSize: ms(13),
    color: colors.tabInactive, // ✅ dark grey
    fontWeight: '400',
  },
  activeLabel: {
    color: colors.onPrimary, // ✅ white
    fontWeight: '500',
  },
});
