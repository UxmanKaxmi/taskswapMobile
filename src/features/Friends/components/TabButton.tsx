// src/features/friends/components/TabButton.tsx
import TextElement from '@shared/components/TextElement/TextElement';
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    paddingBottom: 6,
    fontWeight: '400',
    fontSize: 20,
    paddingHorizontal: 10,
  },
  active: {
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: '#000',
  },
});
