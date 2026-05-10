import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { ms } from 'react-native-size-matters';
import Ripple from '@shared/components/Buttons/Ripple';

type Props = {
  label: string;

  /** Left icon */
  icon?: string;

  /** Optional right icon */
  rightIcon?: string;

  /** Optional right Text */
  rightLabel?: string;

  /** Fired when right icon is pressed */
  onPressRightIcon?: () => void;
};

export default function SectionHeader({
  label,
  icon = 'eye',
  rightIcon,
  rightLabel,
  onPressRightIcon,
}: Props) {
  const showRight = (!!rightIcon || !!rightLabel) && !!onPressRightIcon;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Icon set="ion" name={icon} size={ms(12)} color={colors.muted} />
        <TextElement variant="caption" style={styles.label}>
          {label}
        </TextElement>
      </View>

      {showRight && (
        <Ripple onPress={onPressRightIcon}>
          <View style={styles.rightHitSlop}>
            {rightIcon && <Icon set="ion" name={rightIcon} size={ms(16)} color={colors.muted} />}
            {rightLabel && (
              <TextElement variant="caption" style={styles.rightLabel}>
                {rightLabel}
              </TextElement>
            )}
          </View>
        </Ripple>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    color: colors.muted,
    letterSpacing: 0.9,
    fontSize: ms(12),
    fontWeight: '600',
    marginLeft: spacing.xs,
    lineHeight: ms(14),
  },
  rightHitSlop: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  rightLabel: {
    color: colors.muted,
    letterSpacing: 0.9,
    fontSize: ms(12),
    fontWeight: '600',
    marginLeft: spacing.xs,
    lineHeight: ms(14),
  },
});
