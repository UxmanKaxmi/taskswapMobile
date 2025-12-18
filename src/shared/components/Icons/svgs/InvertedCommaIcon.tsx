import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

const InvertedComma: React.FC<SvgProps> = props => {
  return (
    <Svg viewBox="0 0 16 20" {...props}>
      <Path d="M4 3a3 3 0 100 6c.161 0 .315-.023.469-.047C3.782 10.168 2.493 11 1 11v2c3.309 0 6-2.691 6-6V6a3 3 0 00-3-3zM12 3a3 3 0 100 6c.161 0 .315-.023.469-.047C11.782 10.168 10.493 11 9 11v2c3.309 0 6-2.691 6-6V6a3 3 0 00-3-3z" />
    </Svg>
  );
};

export default InvertedComma;
