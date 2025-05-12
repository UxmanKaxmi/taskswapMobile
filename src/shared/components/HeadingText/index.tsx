// src/shared/components/TextElement/HeadingText.tsx
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import TextElement, { TextElementProps } from '../TextElement/TextElement';
import { spacing } from '@shared/theme';

export interface HeadingTextProps extends Omit<TextElementProps, 'variant' | 'weight' | 'style'> {
  /**
   * Heading level: 1 = largest, 2 = medium.
   * Defaults to 1.
   */
  level?: 1 | 2;
  /**
   * Vertical margin around the heading
   */
  marginVertical?: number;
  /**
   * Horizontal margin around the heading
   */
  marginHorizontal?: number;
  /**
   * Additional style overrides for the text
   */
  style?: StyleProp<TextStyle>;
}

/**
 * HeadingText provides a consistent heading style across the app.
 * Uses TextElement under the hood with preset variants and weight.
 *
 * @example
 * <HeadingText>My Title</HeadingText>
 * <HeadingText level={2} marginVertical={8}>Section</HeadingText>
 */
export default function HeadingText({
  level = 1,
  marginVertical = 0,
  marginHorizontal = spacing.md,
  style,
  children,
  ...rest
}: HeadingTextProps) {
  const variant = level === 1 ? 'title' : 'subtitle';
  return (
    <TextElement
      {...rest}
      variant={variant}
      weight="600"
      style={[{ marginVertical, marginHorizontal }, style]}
    >
      {children}
    </TextElement>
  );
}
