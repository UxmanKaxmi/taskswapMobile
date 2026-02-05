// src/features/friends/components/TabButton.tsx
import TextElement from '@shared/components/TextElement/TextElement';
import { colors } from '@shared/theme';
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

type Props = {
  title: string;
  isActive: boolean;
  onPress: () => void;
};

export default function TabButton({ title, isActive, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress}>
      <TextElement style={[styles.text, isActive && styles.active]}>{title}</TextElement>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    paddingBottom: vs(6),
    fontWeight: '400',
    fontSize: ms(18),
    paddingHorizontal: ms(5),
    color: colors.muted,
  },
  active: {
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: colors.text,
    color: colors.text,
  },
});
