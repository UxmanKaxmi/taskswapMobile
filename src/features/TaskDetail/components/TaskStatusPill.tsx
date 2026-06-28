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

      <TextElement variant="title" weight="700" style={[styles.label, { color: tone.text }]}>
        {isActive ? 'Active' : 'Completed'}
      </TextElement>
    </View>
  );
}

const activeTone = {
  pill: {
    backgroundColor: hexToRgba(colors.tactileMomentumPrimary, 0.2),
    borderColor: hexToRgba(colors.tactileMomentumPrimary, 0.3),
  },
  text: colors.tactileMomentumSecondary,
  icon: colors.tactileMomentumSecondary,
};

const completedTone = {
  pill: {
    backgroundColor: colors.onboardingInk,
    borderColor: colors.onboardingInk,
  },
  text: colors.onboardingCard,
  icon: colors.onboardingPush,
};

const styles = StyleSheet.create({
  pill: {
    minHeight: ms(30),
    paddingHorizontal: ms(12),
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
  },

  dot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.onboardingPushDeep,
  },

  label: {
    fontSize: ms(12),
    fontWeight: '700',
  },
});
