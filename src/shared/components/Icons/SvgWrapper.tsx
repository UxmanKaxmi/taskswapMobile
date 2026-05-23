import React from 'react';
import { ColorValue, StyleProp, ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

type Props = {
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
  children: React.ReactElement<SvgProps>;
};

/**
 * Wraps any SVG component and injects size + color + extra props.
 */
export default function SvgWrapper({ size = 24, color, style, children, ...rest }: Props) {
  return React.cloneElement(children, {
    width: size,
    height: size,
    fill: (color ?? children.props.fill) as string, // fallback to original SVG fill
    style,
    ...rest,
  });
}
