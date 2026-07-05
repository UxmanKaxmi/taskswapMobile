import React from 'react';
import { Text as RNText, TextProps, StyleProp, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';
import { resolveAppTextStyle } from '@shared/theme/fonts';

/**
 * Variants for different text styles.
 * - display: hero-size heading, 40
 *   @example
 *   // 40
 *   <TextElement variant="display" weight="700">Welcome Back</TextElement>
 * - headline: large heading, 32
 *   @example
 *   // 32
 *   <TextElement variant="headline" weight="600">Your Goals</TextElement>
 * - title: section heading, 24
 *   @example
 *   // 24
 *   <TextElement variant="title" weight="700">Profile</TextElement>
 * - subtitle: medium subheading, 18
 *   @example
 *   // 18
 *   <TextElement variant="subtitle" weight="600">Recent Activity</TextElement>
 * - body: regular content, 16
 *   @example
 *   // 16
 *   <TextElement variant="body">You have 3 pending reminders.</TextElement>
 * - bodySmall: compact body copy, 14
 *   @example
 *   // 14
 *   <TextElement variant="bodySmall" color="muted">Visible to followers only</TextElement>
 * - caption: small helper text, 14
 *   @example
 *   // 14
 *   <TextElement variant="caption" color="muted">Updated 5 minutes ago</TextElement>
 * - label: compact UI labels, 12
 *   @example
 *   // 12
 *   <TextElement variant="label" weight="600">Continue</TextElement>
 * - overline: tiny metadata text, 10
 *   @example
 *   // 10
 *   <TextElement variant="overline" color="muted">NEW</TextElement>
 * - tiny: extra-small UI text, 9
 *   @example
 *   // 9
 *   <TextElement variant="tiny" color="muted">Beta</TextElement>
 * - micro: smallest UI text, 8
 *   @example
 *   // 8
 *   <TextElement variant="micro" color="muted">v1.0</TextElement>
 */
export type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline'
  | 'tiny'
  | 'micro';

export interface TextElementProps extends TextProps {
  /**
   * Which typography variant to use
   * @default 'body'
   *
   * @example
   * <TextElement variant="title">Settings</TextElement>
   */
  variant?: TextVariant;
  /**
   * Override the text color
   * @default theme.colors.text
   */
  color?: keyof ReturnType<typeof useTheme>['colors'];
  /**
   * Additional style overrides
   */
  style?: StyleProp<TextStyle>;

  /**
   * Override the font weight
   * @default '400'
   */
  weight?: TextStyle['fontWeight'];

  /**
   * Vertical margin for the text
   */
  marginVertical?: number;

  /**
   * Horizontal margin for the text
   */
  marginHorizontal?: number;
}

export function TextElement({
  variant = 'body',
  color,
  style,
  children,
  weight = '400',
  marginVertical,
  marginHorizontal,
  ...rest
}: TextElementProps) {
  const { typography, colors } = useTheme();

  const variantConfig: Record<TextVariant, { fontSize: number; lineHeight: number }> = {
    display: {
      fontSize: typography.display,
      lineHeight: Math.round(typography.display * 1.15),
    },
    headline: {
      fontSize: typography.headline,
      lineHeight: Math.round(typography.headline * 1.2),
    },
    title: {
      fontSize: typography.title,
      lineHeight: Math.round(typography.title * 1.25),
    },
    subtitle: {
      fontSize: typography.subtitle,
      lineHeight: Math.round(typography.subtitle * 1.3),
    },
    body: {
      fontSize: typography.body,
      lineHeight: Math.round(typography.body * 1.4),
    },
    bodySmall: {
      fontSize: typography.bodySmall,
      lineHeight: Math.round(typography.bodySmall * 1.4),
    },
    caption: {
      fontSize: typography.caption,
      lineHeight: Math.round(typography.caption * 1.35),
    },
    label: {
      fontSize: typography.label,
      lineHeight: Math.round(typography.label * 1.3),
    },
    overline: {
      fontSize: typography.overline,
      lineHeight: Math.round(typography.overline * 1.3),
    },
    tiny: {
      fontSize: typography.tiny,
      lineHeight: Math.round(typography.tiny * 1.25),
    },
    micro: {
      fontSize: typography.micro,
      lineHeight: Math.round(typography.micro * 1.25),
    },
  };

  // Resolve the actual color value
  const actualColor = color != null ? colors[color] : colors.text;
  const { fontSize, lineHeight } = variantConfig[variant];

  const textStyle = resolveAppTextStyle(
    [
      styles.base,
      {
        fontSize,
        color: actualColor,
        lineHeight,
        fontWeight: weight,
        marginVertical,
        marginHorizontal,
      },
      style,
    ],
    { variant, weight },
  );

  return (
    <RNText allowFontScaling={false} style={textStyle} {...rest}>
      {children}
    </RNText>
  );
}

export default TextElement;

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
