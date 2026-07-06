import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import { useTheme } from '@shared/theme';
import { ms } from 'react-native-size-matters';

type Props = {
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
};

export default function InfoIcon({
  onPress,
  size = ms(16),
  color,
  style,
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.placeHolder;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={[styles.container, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Icon set="ion" name="information-circle-outline" size={size} color={resolvedColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
