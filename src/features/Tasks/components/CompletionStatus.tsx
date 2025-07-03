import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { colors, spacing } from '@shared/theme';
import { ms } from 'react-native-size-matters';

type Props = {
  completed: boolean;
};

export default function CompletionStatus({ completed }: Props) {
  const color = completed ? colors.success : colors.muted; // green or gray
  const icon = completed ? 'checkmark-circle' : 'time';
  const label = completed ? 'Completed' : 'Pending';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Icon
          set="ion"
          name={icon}
          color={color}
          size={ms(15)}
          style={{ marginRight: spacing.xs }}
        />
        <TextElement style={{ color, fontWeight: '600' }}>{label}</TextElement>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
