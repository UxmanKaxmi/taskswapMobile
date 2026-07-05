// src/features/tasks/components/GoalDetailCaption.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { GoalType } from '@features/Goals/types/goals';
import { stripOuterQuotes } from '@shared/utils/helperFunctions';

type Props = {
  containerStyle?: object;
  task: {
    type: GoalType;
    text: string;
  };
};

export default function GoalDetailCaption({
  task,
  containerStyle,
}: Props & { containerStyle?: object }) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextElement variant="title" style={styles.mainText}>
        "{stripOuterQuotes(task.text)}"
      </TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: colors.surface ?? '#fff',
    // borderRadius: 16,
    // padding: spacing.md,
    paddingVertical: spacing.md,
  },

  mainText: {
    // marginBottom: vs(8),
    fontSize: ms(26),
    lineHeight: ms(32),
    fontWeight: '600',
  },
});
