// src/shared/components/Shadow.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { shadow } from './shadow';

type ShadowProps = {
  children: React.ReactNode;
  size?: keyof typeof shadow;
  color?: string;
  style?: any;
};

export const Shadow = ({
  children,
  size = 'md',
  color = 'rgba(38, 37, 37, 0.15)', // default
  style,
}: ShadowProps) => {
  return <View style={[styles.shadowBase, shadow[size](color), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  shadowBase: {
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
});
