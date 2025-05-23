// src/shared/components/Avatar.tsx

import React from 'react';
import { Image, StyleSheet, Text, View, ImageStyle, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@shared/theme';

export type AvatarProps = {
  /** Remote image URI to load. If omitted or fails, `fallback` is shown instead. */
  uri?: string;
  /** String to display when no `uri` is provided (e.g. initials or emoji). */
  fallback?: string;
  /** Pixel diameter of the avatar. Default is 44. */
  size?: number;
  /** Border color around the avatar. Default is `colors.border`. */
  borderColor?: string;
  /** Style overrides for the Image element. */
  imageStyle?: ImageStyle;
  /** Style overrides for the fallback View container. */
  fallbackStyle?: ViewStyle;
  /** Style overrides for the fallback Text. */
  textStyle?: TextStyle;
};

/**
 * A circular avatar component that displays either a remote image or a fallback text/emoji.
 *
 * @param {AvatarProps} props
 * @returns {JSX.Element}
 *
 * @example
 * // Show a user image
 * <Avatar
 *   uri="https://example.com/user.png"
 *   size={60}
 *   borderColor="#5C6BC0"
 * />
 *
 * @example
 * // Show initials when no image is available
 * <Avatar
 *   fallback="UK"
 *   size={50}
 *   backgroundColor="#E0E0E0"
 * />
 */
export default function Avatar({
  uri,
  fallback = '?',
  size = 44,
  borderColor = colors.border,
  imageStyle,
  fallbackStyle,
  textStyle,
}: AvatarProps) {
  const radius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor,
          },
          imageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor,
        },
        fallbackStyle,
      ]}
    >
      <Text style={[styles.fallbackText, { fontSize: size * 0.4 }, textStyle]}>{fallback}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 2,
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  fallbackText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
