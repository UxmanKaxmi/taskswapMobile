import { StyleProp, StyleSheet, TextStyle } from 'react-native';

export type AppFontVariant =
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

type FontRole = 'headline' | 'body';
type FontWeightKey = '300' | '400' | '500' | '600' | '700' | '800' | '900';

const FONT_ROLE_BY_VARIANT: Record<AppFontVariant, FontRole> = {
  display: 'headline',
  headline: 'headline',
  title: 'headline',
  subtitle: 'headline',
  body: 'body',
  bodySmall: 'body',
  caption: 'body',
  label: 'body',
  overline: 'body',
  tiny: 'body',
  micro: 'body',
};

const FONT_FAMILIES: Record<FontRole, Record<FontWeightKey, string>> = {
  headline: {
    '300': 'PlusJakartaSans-Light',
    '400': 'PlusJakartaSans-Regular',
    '500': 'PlusJakartaSans-Medium',
    '600': 'PlusJakartaSans-SemiBold',
    '700': 'PlusJakartaSans-Bold',
    '800': 'PlusJakartaSans-ExtraBold',
    '900': 'PlusJakartaSans-ExtraBold',
  },
  body: {
    '300': 'BeVietnamPro-Light',
    '400': 'BeVietnamPro-Regular',
    '500': 'BeVietnamPro-Medium',
    '600': 'BeVietnamPro-SemiBold',
    '700': 'BeVietnamPro-Bold',
    '800': 'BeVietnamPro-ExtraBold',
    '900': 'BeVietnamPro-Black',
  },
};

const normalizeFontWeight = (weight?: TextStyle['fontWeight']): FontWeightKey => {
  if (weight == null || weight === 'normal') {
    return '400';
  }

  if (weight === 'bold') {
    return '700';
  }

  const numericWeight = Number(weight);

  if (Number.isNaN(numericWeight)) {
    return '400';
  }

  if (numericWeight <= 350) {
    return '300';
  }

  if (numericWeight <= 450) {
    return '400';
  }

  if (numericWeight <= 550) {
    return '500';
  }

  if (numericWeight <= 650) {
    return '600';
  }

  if (numericWeight <= 750) {
    return '700';
  }

  if (numericWeight <= 850) {
    return '800';
  }

  return '900';
};

export const getAppFontFamily = ({
  variant = 'body',
  weight = '400',
}: {
  variant?: AppFontVariant;
  weight?: TextStyle['fontWeight'];
}) => FONT_FAMILIES[FONT_ROLE_BY_VARIANT[variant]][normalizeFontWeight(weight)];

export const resolveAppTextStyle = (
  style: StyleProp<TextStyle>,
  {
    variant = 'body',
    weight,
  }: {
    variant?: AppFontVariant;
    weight?: TextStyle['fontWeight'];
  } = {},
): TextStyle => {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};

  if (flattenedStyle.fontFamily) {
    return flattenedStyle;
  }

  return {
    ...flattenedStyle,
    fontFamily: getAppFontFamily({
      variant,
      weight: flattenedStyle.fontWeight ?? weight,
    }),
    fontWeight: undefined,
  };
};
