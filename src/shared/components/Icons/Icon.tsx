import React from 'react';
import { Animated, ColorValue, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import SvgWrapper from './SvgWrapper';
import { svgIcons, SvgIconName } from './svgRegistry';

type SharedProps = {
  size?: number;
  color?: ColorValue | Animated.AnimatedInterpolation<string>;
  variant?: 'primary' | 'accent' | 'success' | 'error' | 'text';
  style?: StyleProp<ViewStyle>;
};

// -------------------------------- ICON TYPES --------------------------------

export type IconProps = SharedProps & {
  set: 'svg' | 'fa6' | 'ion';
  name: string;
  iconStyle?: 'solid' | 'regular' | 'brand';
};

// -------------------------------- COMPONENT --------------------------------

export default function Icon({
  set,
  name,
  size = 24,
  color,
  variant = 'text',
  style,
  iconStyle = 'regular',
}: IconProps) {
  const theme = useTheme();
  const iconColor = (color ?? theme.colors[variant]) as ColorValue;

  // ---- SVG ICON ----
  if (set === 'svg') {
    const Component = svgIcons[name as SvgIconName];
    return (
      <SvgWrapper size={size} color={iconColor} style={style}>
        <Component />
      </SvgWrapper>
    );
  }

  // ---- FONT AWESOME ----
  if (set === 'fa6') {
    return (
      <FontAwesome6
        size={size}
        iconStyle={iconStyle}
        color={iconColor}
        style={style}
        name={name as any}
      />
    );
  }

  // ---- IONICONS ----
  if (set === 'ion') {
    return <Ionicons size={size + 2} color={iconColor} style={style} name={name as any} />;
  }

  // ---- Exhaustive check (never happens) ----
  return null;
}
