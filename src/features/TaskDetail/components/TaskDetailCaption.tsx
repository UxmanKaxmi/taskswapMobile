// src/features/tasks/components/TaskDetailCaption.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { TaskType } from '@features/Tasks/types/tasks';
import { stripOuterQuotes } from '@shared/utils/helperFunctions';

type Props = {
  containerStyle?: object;
  task: {
    type: TaskType;
    text: string;
  };
};

export default function TaskDetailCaption({
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
