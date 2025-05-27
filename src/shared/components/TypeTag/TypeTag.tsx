// src/shared/components/TypeTag.tsx

import React from 'react';
import { StyleSheet, TextStyle, View, Text } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { TaskType } from '@features/Tasks/types/tasks';
import { capitalizeFirstLetter } from '@shared/utils/helperFunctions';
import { colors } from '@shared/theme';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
import Icon from '../Icons/Icon';

//only used home screen type

type Props = {
  type: TaskType;
  iconEnabled?: boolean;
  styleOverride?: TextStyle;
};

const typeBackgrounds: Record<TaskType, string> = {
  reminder: colors.reminderBg,
  decision: colors.decisionBg,
  motivation: colors.motivationBg,
  advice: colors.adviceBg,
};

const typeIcons: Record<TaskType, string> = {
  reminder: 'bell',
  decision: 'hard-drive',
  motivation: 'lightbulb',
  advice: 'message',
};

export default function TypeTag({ type, iconEnabled = true, styleOverride }: Props) {
  const backgroundColor = typeBackgrounds[type] || colors.accent;
  const label = capitalizeFirstLetter(type);
  const iconName = typeIcons[type];

  return (
    <View style={[styles.container, { backgroundColor }, styleOverride]}>
      {iconEnabled && (
        <Icon
          set="fa6"
          name={iconName}
          size={moderateScale(12)}
          color={colors.text}
          style={styles.icon}
          iconStyle="regular"
        />
      )}
      <TextElement variant="caption" color="text" style={styles.text}>
        {label}
      </TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateVerticalScale(5),
    borderRadius: 40,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: moderateScale(6),
  },
  text: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
