import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';

import Ripple from '@shared/components/Buttons/Ripple';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { spacing, colors } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import { hexToRgba, MakeFirstLetterUppercase } from '@shared/utils/helperFunctions';
import { Shadow } from '@shared/components/Shadow';

type Props = {
  title: string;
  description: string;
  icon: { set: 'fa6' | 'ion'; name: string };
  color: string;
  bg: string;
  onPress: () => void;
  /** 🔥 design-only */
  forcePressed?: boolean;
};

export default function ImpactOptionCard({
  title,
  description,
  icon,
  color,
  bg,
  onPress,
  forcePressed,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const pressed = useRef(new Animated.Value(0)).current;

  const AnimatedIcon = Animated.createAnimatedComponent(Icon);
  const CARD_HEIGHT = vs(80); // you can tweak to 84–92
  // 🔹 Pressed preview (design-only)
  useEffect(() => {
    Animated.parallel([
      Animated.timing(pressed, {
        toValue: forcePressed ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: forcePressed ? 0.98 : 1,
        speed: 30,
        bounciness: 0,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: forcePressed ? 0.96 : 1,
        duration: 160,
        useNativeDriver: false,
      }),
    ]).start();
  }, [forcePressed]);

  const onPressIn = () => {
    Animated.parallel([
      Animated.timing(pressed, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 0.97,
        speed: 30,
        bounciness: 0,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.timing(pressed, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 30,
        bounciness: 0,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }),
    ]).start();
  };

  /* ---------- Animated styles ---------- */

  const cardBg = pressed.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.card, bg],
  });

  //   const iconBg = pressed.interpolate({
  //     inputRange: [0, 1],
  //     outputRange: [bg, color],
  //   });

  //   const iconColor = pressed.interpolate({
  //     inputRange: [0, 1],
  //     outputRange: [color, colors.background],
  //   });

  const chevronColor = pressed.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.disabled, colors.text],
  });

  const borderColor = pressed.interpolate({
    inputRange: [0, 1],
    outputRange: [hexToRgba(color, 0.12), hexToRgba(color, 0.45)],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity,
      }}
    >
      <Shadow size="sm">
        {/* OUTER owns radius */}
        <View style={[styles.outer, { backgroundColor: bg }]}>
          {/* Inset border (NO white bleed) */}
          <Animated.View style={[styles.insetBorder, { borderColor }]}>
            <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
              <Animated.View
                style={[
                  styles.card,
                  {
                    height: CARD_HEIGHT,

                    backgroundColor: cardBg,
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              >
                <Animated.View style={[styles.iconBox, { backgroundColor: bg }]}>
                  <Icon set={'fa6'} name={icon.name} size={22} color={color} />
                </Animated.View>

                <View style={styles.content}>
                  <TextElement variant="subtitle" weight="600">
                    {MakeFirstLetterUppercase(title)}
                  </TextElement>
                  <TextElement variant="caption" style={styles.description} color="muted">
                    {description}
                  </TextElement>
                </View>

                <AnimatedIcon set="ion" name="chevron-forward" size={vs(20)} color={chevronColor} />
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>
      </Shadow>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  outer: {
    borderRadius: 18,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },

  insetBorder: {
    borderRadius: 18,
    // borderWidth: 1,
    // padding: 1, // 🔥 inset, prevents halo
  },
  description: {
    fontSize: ms(12),
    marginRight: spacing.sm,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: spacing.md,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  content: {
    flex: 1,
  },
});
