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
        <Icon set="ion" name="checkmark-circle" size={14} color={tone.icon} />
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
  icon: colors.motivationBgHardest,
};

const completedTone = {
  pill: {
    backgroundColor: hexToRgba(colors.motivationBgHardest, 0.08),
    borderColor: hexToRgba(colors.motivationBgHardest, 0.12),
  },
  text: '#7B8A84',
  icon: colors.motivationBgHardest,
};

const styles = StyleSheet.create({
  pill: {
    minHeight: 28,
    paddingHorizontal: 10,
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
    fontSize: ms(11),
    fontWeight: '500',
  },
});
