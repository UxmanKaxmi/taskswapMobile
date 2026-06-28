import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ms } from 'react-native-size-matters';

import { Icon } from '@shared/components/Icons';
import { colors } from '@shared/theme';

type Props = {
  iconName: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  iconColor?: string;
};

export default function NotificationIconBadge({
  iconName,
  size = ms(18),
  style,
  backgroundColor = colors.tactileMomentumPrimary,
  iconColor = colors.tactileMomentumSecondary,
}: Props) {
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Icon set="fa6" name={iconName} size={size} color={iconColor} iconStyle="solid" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
