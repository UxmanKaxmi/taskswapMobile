import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import { colors } from '@shared/theme';
import { hexToRgba } from '@shared/utils/helperFunctions';

export type TaskStatus = 'active' | 'completed';

type Props = {
  status: TaskStatus;
};

export default function TaskStatusPill({ status }: Props) {
  const isActive = status === 'active';
  const tone = isActive ? activeTone : completedTone;

  return (
    <View style={[styles.pill, tone.pill]}>
      {isActive ? (
        <View style={styles.dot} />
      ) : (
        <Icon set="ion" name="checkmark" size={12} color={tone.text} />
      )}

      <TextElement style={[styles.label, { color: tone.text }]}>
        {isActive ? 'Active' : 'Completed'}
      </TextElement>
    </View>
  );
}

const activeTone = {
  pill: {
    backgroundColor: hexToRgba(colors.motivationBgHardest, 0.1),
    borderColor: hexToRgba(colors.motivationBgHardest, 0.24),
  },
  text: colors.motivationBgHardest,
};

const completedTone = {
  pill: {
    backgroundColor: colors.onPrimary,
    borderColor: '#D7E3DD',
  },
  text: '#6B7D75',
};

const styles = StyleSheet.create({
  pill: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.motivationBgHardest,
  },

  label: {
    fontSize: ms(12),
    fontWeight: '500',
  },
});
