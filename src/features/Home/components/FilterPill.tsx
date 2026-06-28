import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function FilterPill({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pill, active && styles.activePill, pressed && styles.pressed]}
    >
      <TextElement style={[styles.label, active && styles.activeLabel]}>{label}</TextElement>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: ms(22),
    paddingVertical: vs(8),
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activePill: {
    backgroundColor: colors.tabActive,
    borderColor: colors.tabActive,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontSize: ms(15),
    lineHeight: ms(18),
    color: colors.tabInactive,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
