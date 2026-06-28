import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import AppLogo from '@shared/components/AppLogo';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors } from '@shared/theme';

type OnboardingHeaderProps = {
  actionLabel?: string;
  actionAccessibilityLabel?: string;
  actionIcon?: 'close';
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function OnboardingHeader({
  actionLabel,
  actionAccessibilityLabel,
  actionIcon,
  onActionPress,
  style,
}: OnboardingHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <AppLogo size="lg" align="left" textStyle={styles.wordmarkText} />

      {onActionPress ? (
        <Pressable
          hitSlop={12}
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          style={({ pressed }) => [
            actionIcon ? styles.iconButton : styles.textButton,
            pressed && styles.pressed,
          ]}
        >
          {actionIcon === 'close' ? (
            <Icon set="ion" name="close" size={ms(20)} color={colors.onboardingInk} />
          ) : (
            <TextElement variant="label" weight="600" style={styles.actionText}>
              {actionLabel}
            </TextElement>
          )}
        </Pressable>
      ) : (
        <View style={styles.textButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(22),
    paddingHorizontal: ms(28),
  },
  wordmarkText: {
    color: colors.onboardingInk,
    letterSpacing: 0,
    fontSize: ms(20),
  },
  textButton: {
    width: ms(56),
    alignItems: 'flex-end',
  },
  iconButton: {
    width: ms(35),
    height: ms(35),
    borderRadius: ms(35 / 2),
    backgroundColor: colors.onboardingLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: colors.onboardingMuted,
    fontSize: ms(16),
  },
  pressed: {
    opacity: 0.7,
  },
});
