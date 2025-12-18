import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { ms } from 'react-native-size-matters';

type Props = {
  label: string;
  icon?: string;
};

export default function SectionHeader({ label, icon = 'eye' }: Props) {
  return (
    <View style={styles.container}>
      <Icon set="ion" name={icon} size={ms(12)} color={colors.muted} />

      <TextElement variant="caption" style={styles.label}>
        {label.toUpperCase()}
      </TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.muted,
    letterSpacing: 0.9,
    fontSize: ms(12),
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});
