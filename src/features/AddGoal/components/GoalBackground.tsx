import React from 'react';
import { View, StyleSheet } from 'react-native';

import Icon from '@shared/components/Icons/Icon';
import { useTheme } from '@shared/theme';

type Props = {
  icon: string;
  color?: string;
  iconOpacity?: number;
};

export default function GoalBackground({ icon, color, iconOpacity = 0.4 }: Props) {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" style={styles.container}>
      <Icon
        set="fa6"
        name={icon}
        size={300}
        color={color ?? colors.primary}
        style={{ ...styles.icon, opacity: iconOpacity }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 300,
    right: -20,
  },
  icon: {
    transform: [{ rotate: '-10deg' }],
  },
});
