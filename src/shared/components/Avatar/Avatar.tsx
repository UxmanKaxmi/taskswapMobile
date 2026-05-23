// src/shared/components/Avatar.tsx

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ImageStyle,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors } from '@shared/theme';
import { resolveAppTextStyle } from '@shared/theme/fonts';

export type AvatarProps = {
  /** Remote image URI to load. If omitted or fails, `fallback` is shown instead. */
  uri?: string | null;
  /** String to display when no `uri` is provided (e.g. initials or emoji). */
  fallback?: string | null;
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
  /** Optional wrapper style for avatar container */
  style?: StyleProp<ImageStyle>;
};

function getFallbackText(fallback?: string) {
  const trimmedFallback = fallback?.trim();

  if (!trimmedFallback) {
    return '?';
  }

  const words = trimmedFallback.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map(word => Array.from(word)[0])
      .join('')
      .toUpperCase();
  }

  return Array.from(trimmedFallback).slice(0, 2).join('').toUpperCase();
}

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
  style,
}: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const radius = size / 2;
  const fallbackText = getFallbackText(fallback);
  const fallbackTextStyle = resolveAppTextStyle(
    [styles.fallbackText, { fontSize: size * 0.36, lineHeight: size * 0.48 }, textStyle],
    { variant: 'label' },
  );

  React.useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  if (uri && !imageFailed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setImageFailed(true)}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor,
          },
          imageStyle,
          style,
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
        style,
      ]}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit style={fallbackTextStyle}>
        {fallbackText}
      </Text>
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
    overflow: 'hidden',
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '700',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
