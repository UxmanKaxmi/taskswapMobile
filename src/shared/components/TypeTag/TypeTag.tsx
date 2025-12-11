// src/shared/components/TypeTag.tsx

import React from 'react';
import { StyleSheet, TextStyle, View, Text } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { TaskType } from '@features/Tasks/types/tasks';
import { capitalizeFirstLetter } from '@shared/utils/helperFunctions';
import { colors } from '@shared/theme';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
import Icon from '../Icons/Icon';
import { typeBackgroundsHard, typeIcons } from '@shared/utils/typeVisuals';

//only used home screen type

type Props = {
  type: TaskType;
  iconEnabled?: boolean;
  styleOverride?: TextStyle;
  iconStyle?: 'solid' | 'regular' | 'brand';
  iconSet?: 'fa6' | 'ion';
};

export default function TypeTag({
  type,
  iconEnabled = true,
  styleOverride,
  iconStyle = 'regular',
  iconSet = 'fa6',
}: Props) {
  const backgroundColor = typeBackgroundsHard[type];
  const label = capitalizeFirstLetter(type);
  const iconName = typeIcons[type];

  return (
    <View style={[styles.container, { backgroundColor }, styleOverride]}>
      {iconEnabled && (
        <Icon
          set={iconSet}
          name={iconName}
          size={moderateScale(12)}
          color={colors.muted}
          style={styles.icon}
          iconStyle={iconStyle}
        />
      )}
      <TextElement variant="caption" color="muted" style={styles.text}>
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
