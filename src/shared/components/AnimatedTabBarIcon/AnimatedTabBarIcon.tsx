import { Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Icon from '../Icons/Icon';
import { useIsFocused } from '@react-navigation/native';

type Props = {
  name: string;
  size: number;
  color: string;
  focused: boolean;
};

export default function AnimatedTabBarIcon({ name, size, color }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 1,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 4,
        }),
      ]).start();
    } else {
      scale.setValue(1); // reset cleanly when not focused
    }
  }, [isFocused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon set="fa6" name={name} size={size} color={color} iconStyle="solid" />
    </Animated.View>
  );
}
