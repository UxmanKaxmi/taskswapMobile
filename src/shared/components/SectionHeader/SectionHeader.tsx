import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { ThemeColors, spacing, useTheme, useThemedStyles } from '@shared/theme';
import { ms } from 'react-native-size-matters';
import Ripple from '@shared/components/Buttons/Ripple';

type Props = {
  label: string;

  /** Left icon */
  icon?: string;

  /** Icon set for the left icon (defaults to Ionicons) */
  iconSet?: 'ion' | 'fa6';

  /** FontAwesome glyph style when iconSet is 'fa6' */
  iconStyle?: 'solid' | 'regular' | 'brand';

  /** Override the left icon color (defaults to muted) */
  iconColor?: string;

  /** Override the label color (defaults to muted) */
  labelColor?: string;

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
  iconSet = 'ion',
  iconStyle = 'solid',
  iconColor,
  labelColor,
  rightIcon,
  rightLabel,
  onPressRightIcon,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const resolvedIconColor = iconColor ?? colors.onboardingInk;
  const showRight = (!!rightIcon || !!rightLabel) && !!onPressRightIcon;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Icon
          set={iconSet}
          name={icon}
          iconStyle={iconStyle}
          size={ms(12)}
          color={resolvedIconColor}
        />
        <TextElement
          variant="caption"
          style={[styles.label, labelColor ? { color: labelColor } : null]}
        >
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      color: colors.onboardingInk,
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
