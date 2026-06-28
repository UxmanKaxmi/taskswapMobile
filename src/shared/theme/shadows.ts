import { Platform, type ViewStyle } from 'react-native';

type ShadowOffset = {
  width: number;
  height: number;
};

type PlatformShadowOptions = {
  color?: string;
  opacity?: number;
  radius: number;
  offset?: ShadowOffset;
};

const DEFAULT_SHADOW_COLOR = '#000';
const DEFAULT_SHADOW_OFFSET: ShadowOffset = { width: 0, height: 2 };

const clampAlpha = (value: number) => Math.max(0, Math.min(1, value));

const colorWithOpacity = (color: string, opacity = 1) => {
  const normalizedOpacity = clampAlpha(opacity);
  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

  if (hexMatch) {
    let hex = hexMatch[1];

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(part => part + part)
        .join('');
    }

    const alpha = hex.length === 8 ? clampAlpha(parseInt(hex.slice(6, 8), 16) / 255) : 1;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha * normalizedOpacity})`;
  }

  const rgbaMatch = color.match(
    /^rgba?\(\s*([.\d]+)\s*,\s*([.\d]+)\s*,\s*([.\d]+)(?:\s*,\s*([.\d]+))?\s*\)$/i,
  );

  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    const alpha = a === undefined ? 1 : clampAlpha(Number(a));

    return `rgba(${r}, ${g}, ${b}, ${alpha * normalizedOpacity})`;
  }

  return color;
};

export const platformShadow = ({
  color = DEFAULT_SHADOW_COLOR,
  opacity = 1,
  radius,
  offset = DEFAULT_SHADOW_OFFSET,
}: PlatformShadowOptions): ViewStyle =>
  Platform.OS === 'android'
    ? {
        boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${colorWithOpacity(
          color,
          opacity,
        )}`,
        elevation: 0,
      }
    : {
        shadowColor: color,
        shadowOpacity: opacity,
        shadowOffset: offset,
        shadowRadius: radius,
      };

export const shadows = {
  card: platformShadow({
    color: '#000',
    opacity: 0.1,
    offset: { width: 0, height: 2 },
    radius: 4,
  }),
};
