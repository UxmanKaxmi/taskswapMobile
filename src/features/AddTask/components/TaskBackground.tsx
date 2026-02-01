import React from 'react';
import { View, StyleSheet } from 'react-native';

import Icon from '@shared/components/Icons/Icon';
import { colors } from '@shared/theme';

type Props = {
  icon: string;
  color?: string;
  iconOpacity?: number;
};

export default function TaskBackground({ icon, color = colors.primary, iconOpacity = 0.4 }: Props) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <Icon
        set="fa6"
        name={icon}
        size={300}
        color={color}
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
