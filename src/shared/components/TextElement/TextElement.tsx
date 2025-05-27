import React from 'react';
import { Text as RNText, TextProps, StyleProp, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';

/**
 * Variants for different text styles.
 * - title: large headings
 * - subtitle: medium subheadings
 * - body: regular content
 * - caption: small captions and hints
 */
export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';

export interface TextElementProps extends TextProps {
  /**
   * Which typography variant to use
   * @default 'body'
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

  // map variant to theme typography sizes
  const sizeMap: Record<TextVariant, number> = {
    title: typography.title,
    subtitle: typography.subtitle,
    body: typography.body,
    caption: typography.caption,
  };

  // Resolve the actual color value
  const actualColor = color != null ? colors[color] : colors.text;

  // compute styles
  const textStyle: TextStyle = {
    fontSize: sizeMap[variant],
    color: actualColor,
    lineHeight: Math.round(sizeMap[variant] * 1.4),
    fontWeight: weight,
    marginVertical,
    marginHorizontal,
  };

  return (
    <RNText allowFontScaling={false} style={[styles.base, textStyle, style]} {...rest}>
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
