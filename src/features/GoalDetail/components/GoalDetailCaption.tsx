// src/features/tasks/components/GoalDetailCaption.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, useTheme } from '@shared/theme';
import { GoalType } from '@features/Goals/types/goals';
import { stripOuterQuotes } from '@shared/utils/helperFunctions';
import { useMorphTarget } from '@shared/morph/useMorphElement';
import { resolveAppTextStyle } from '@shared/theme/fonts';

type Props = {
  containerStyle?: object;
  task: {
    id?: string;
    type: GoalType;
    text: string;
  };
};

export default function GoalDetailCaption({
  task,
  containerStyle,
}: Props & { containerStyle?: object }) {
  const { colors } = useTheme();
  const { ref, onLayout, animatedStyle } = useMorphTarget(
    task.id ?? '',
    'text',
    {
      borderRadius: 24,
      backgroundColor: 'transparent',
      fontSize: ms(26),
      textColor: colors.text,
      paddingHorizontal: ms(4),
      paddingVertical: vs(6),
      align: 'flex-start',
      // Must match styles.mainText as rendered by TextElement variant="title".
      textStyle: resolveAppTextStyle(
        [{ fontSize: ms(26), lineHeight: ms(32), fontWeight: '600', color: colors.text }],
        { variant: 'title' },
      ),
    },
    // The clone lands showing exactly what the caption renders — quotes and all.
    { text: `"${stripOuterQuotes(task.text)}"` },
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View ref={ref} onLayout={onLayout} collapsable={false} style={animatedStyle}>
        <TextElement variant="title" style={styles.mainText}>
          "{stripOuterQuotes(task.text)}"
        </TextElement>
      </Animated.View>
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
