import React from 'react';
import { ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  style?: ViewStyle;
  children: React.ReactElement<SvgProps>;
};

/**
 * Wraps any SVG component and injects size + color + extra props.
 */
export default function SvgWrapper({ size = 24, color, style, children, ...rest }: Props) {
  return React.cloneElement(children, {
    width: size,
    height: size,
    fill: color ?? children.props.fill, // fallback to original SVG fill
    style,
    ...rest,
  });
}
