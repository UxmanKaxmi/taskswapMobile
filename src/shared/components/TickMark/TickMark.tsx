import React from 'react';
import { StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';
import Svg, { Path } from 'react-native-svg';

type TickMarkProps = {
  color: string;
  height: number;
  width?: number;
};

const DEFAULT_WIDTH = ms(6);

export default function TickMark({ color, height, width = DEFAULT_WIDTH }: TickMarkProps) {
  const radius = Math.min(width, height) * 0.28;
  const slant = Math.min(width * 0.42, height * 0.24);
  const path = buildPath(width, height, radius, slant);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
      <Path d={path} fill={color} />
    </Svg>
  );
}

function buildPath(width: number, height: number, radius: number, slant: number) {
  return [
    `M ${slant + radius} 0`,
    `H ${width - radius}`,
    `Q ${width} 0 ${width} ${radius}`,
    `L ${width - slant} ${height - radius}`,
    `Q ${width - slant} ${height} ${width - slant - radius} ${height}`,
    `H ${radius}`,
    `Q 0 ${height} 0 ${height - radius}`,
    `L ${slant} ${radius}`,
    `Q ${slant} 0 ${slant + radius} 0`,
    'Z',
  ].join(' ');
}

const styles = StyleSheet.create({
  svg: {
    overflow: 'visible',
  },
});
