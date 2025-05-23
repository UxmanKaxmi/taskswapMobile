// src/shared/components/Icon.tsx

import React from 'react';
import { ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

type IconSet = 'ion' | 'fa6';

type IoniconsName = Parameters<typeof Ionicons>['0']['name'];
type FontAwesome6Name = string; // could be stricter if needed

type SharedProps = {
  size?: number;
  color?: string;
  variant?: 'primary' | 'accent' | 'success' | 'error' | 'text';
  style?: ViewStyle;
};

type FontAwesomeProps = SharedProps & {
  set: 'fa6';
  name: FontAwesome6Name;
  iconStyle?: 'solid' | 'regular' | 'brand';
};

type IoniconProps = SharedProps & {
  set?: 'ion';
  name: IoniconsName;
  iconStyle?: never;
};

type Props = FontAwesomeProps | IoniconProps;

/**
 * Unified Icon wrapper with autocomplete support for Ionicons and FontAwesome6.
 */
export default function Icon({
  name,
  set = 'fa6',
  size = 24,
  color,
  variant = 'text',
  style,
  iconStyle = 'regular',
}: Props) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors[variant];

  if (set === 'fa6') {
    return (
      <FontAwesome6
        name={name as any}
        size={size}
        iconStyle={iconStyle}
        color={iconColor}
        style={style}
      />
    );
  }

  return <Ionicons name={name as IoniconsName} size={size} color={iconColor} style={style} />;
}
