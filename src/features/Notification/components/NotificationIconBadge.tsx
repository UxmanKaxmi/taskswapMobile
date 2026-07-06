import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ms } from 'react-native-size-matters';

import { Icon } from '@shared/components/Icons';
import { useTheme } from '@shared/theme';

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
  backgroundColor,
  iconColor,
}: Props) {
  const { colors } = useTheme();
  const resolvedBackgroundColor = backgroundColor ?? colors.tactileMomentumPrimary;
  const resolvedIconColor = iconColor ?? colors.tactileMomentumSecondary;

  return (
    <View style={[styles.badge, { backgroundColor: resolvedBackgroundColor }, style]}>
      <Icon set="fa6" name={iconName} size={size} color={resolvedIconColor} iconStyle="solid" />
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
