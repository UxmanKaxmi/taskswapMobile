import React from 'react';
import { Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import { colors, platformShadow } from '@shared/theme';
import { TaskType } from '@features/Tasks/types/tasks';
import { haptics } from '@shared/utils/haptics';
import ButtonBase from '../Buttons/ButtonBase';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';

interface PushButtonProps {
  onPress: () => void;
  label?: string;
  activeLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  taskType?: TaskType;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  hideIcon?: boolean;
  active?: boolean;
  variant?: 'default' | 'push' | 'cheer';
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export default function PushButton({
  onPress,
  label = 'Push',
  activeLabel,
  size = 'sm',
  taskType,
  disabled = false,
  loading = false,
  icon,
  hideIcon = false,
  active = false,
  variant = 'default',
  style,
  buttonStyle,
  textStyle,
  backgroundColor,
  textColor = colors.onPrimary,
  borderColor = 'transparent',
}: PushButtonProps) {
  const isLocked = disabled || loading || active;
  const resolvedBg = backgroundColor ?? colors[`${taskType || 'reminder'}BgHardest`];

  if (variant !== 'default') {
    const isPushVariant = variant === 'push';
    const sizeConfig = customSizeStyles[size];
    const textVariant = customTextVariants[size];

    const resolvedIcon = hideIcon ? null : icon ? (
      icon
    ) : isPushVariant && active ? (
      <Icon
        set="fa6"
        name="check"
        iconStyle="solid"
        size={15}
        color={colors.tactileMomentumPrimary}
      />
    ) : isPushVariant ? (
      <Icon set="ion" name="arrow-forward" size={15} color={colors.tactileMomentumSecondary} />
    ) : null;

    return (
      <Pressable
        onPressIn={() => {
          if (isLocked) return;
          haptics.selection();
        }}
        onPress={() => {
          if (isLocked) return;
          onPress();
        }}
        disabled={isLocked}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLocked, selected: active }}
        style={({ pressed }) => [
          styles.pillBase,
          isPushVariant ? styles.pushPill : styles.cheerPill,
          sizeConfig,
          active && (isPushVariant ? styles.pushActive : styles.cheerActive),
          pressed && !isLocked && styles.pillPressed,
          style,
          buttonStyle,
        ]}
      >
        <View style={styles.contentRow}>
          {/* {resolvedIcon ? <View style={styles.iconWrap}>{resolvedIcon}</View> : null} */}
          <TextElement
            variant={textVariant}
            weight="700"
            style={[
              styles.pillText,
              isPushVariant
                ? active
                  ? styles.pushActiveText
                  : styles.pushIdleText
                : styles.cheerText,
              textStyle,
            ]}
          >
            {active ? (activeLabel ?? (isPushVariant ? 'Pushed' : 'Cheered ✓')) : label}
          </TextElement>
          {resolvedIcon ? <View style={styles.iconWrapRight}>{resolvedIcon}</View> : null}
        </View>
      </Pressable>
    );
  }

  const sizeStyles = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large,
  };

  const textSizeStyles = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  };

  return (
    <ButtonBase
      title={label}
      onPress={onPress}
      isLoading={loading}
      disabled={isLocked}
      icon={icon}
      backgroundColor={resolvedBg}
      textColor={textColor}
      borderColor={borderColor}
      style={StyleSheet.flatten([sizeStyles[size], style, buttonStyle])}
      textStyle={StyleSheet.flatten([textSizeStyles[size], textStyle])}
    />
  );
}

const customSizeStyles = {
  sm: {
    paddingVertical: vs(8),
    paddingHorizontal: ms(18),
  },
  md: {
    paddingVertical: vs(9),
    paddingHorizontal: ms(20),
  },
  lg: {
    paddingVertical: vs(11),
    paddingHorizontal: ms(24),
  },
} as const;

const customTextVariants = {
  sm: 'subtitle',
  md: 'title',
  lg: 'title',
} as const;

const styles = StyleSheet.create({
  /* Button sizes */
  small: {
    paddingVertical: vs(6),
    paddingHorizontal: ms(12),
    borderRadius: ms(24),
    alignSelf: 'flex-start',
    marginVertical: 0,
    marginHorizontal: 0,
  },
  medium: {
    paddingVertical: vs(10),
    paddingHorizontal: ms(18),
    borderRadius: ms(24),
  },
  large: {
    paddingVertical: vs(14),
    paddingHorizontal: ms(24),
    borderRadius: ms(24),
  },

  /* Text sizes */
  textSm: {
    fontSize: ms(12),
    fontWeight: '600',
  },
  textMd: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  textLg: {
    fontSize: ms(16),
    fontWeight: '700',
  },

  pillBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(24),
    borderWidth: 1.5,
    alignSelf: 'flex-start',
    minHeight: 38,
    ...platformShadow({
      color: colors.tactileMomentumSecondary,
      opacity: 0.16,
      radius: 0,
      offset: { width: 0, height: 2 },
    }),
  },
  pushPill: {
    backgroundColor: colors.tactileMomentumPrimary,
    borderColor: colors.tactileMomentumPrimary,
  },
  pushActive: {
    backgroundColor: colors.tactileMomentumSecondary,
    borderColor: colors.tactileMomentumSecondary,
    shadowOpacity: 0,
    shadowRadius: 0,
    boxShadow: 'none',
    elevation: 0,
  },
  cheerPill: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.border,
    ...platformShadow({
      color: colors.border,
      opacity: 0.16,
      radius: 0,
      offset: { width: 0, height: 2 },
    }),
  },
  cheerActive: {
    shadowOpacity: 0,
    shadowRadius: 0,
    boxShadow: 'none',
    elevation: 0,
  },
  pillPressed: {
    transform: [{ translateY: 2 }],
    shadowOpacity: 0,
    shadowRadius: 0,
    boxShadow: 'none',
    elevation: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapRight: {
    marginLeft: 7,
  },
  pillText: {
    includeFontPadding: false,
  },
  pushIdleText: {
    color: colors.tactileMomentumSecondary,
  },
  pushActiveText: {
    color: colors.tactileMomentumPrimary,
  },
  cheerText: {
    color: colors.tactileMomentumSecondary,
  },
});
