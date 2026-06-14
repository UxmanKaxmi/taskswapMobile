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
    '300': 'BricolageGrotesque-Light',
    '400': 'BricolageGrotesque-Regular',
    '500': 'BricolageGrotesque-Medium',
    '600': 'BricolageGrotesque-SemiBold',
    '700': 'BricolageGrotesque-Bold',
    '800': 'BricolageGrotesque-ExtraBold',
    '900': 'BricolageGrotesque-ExtraBold',
  },
  body: {
    '300': 'HankenGrotesk-Light',
    '400': 'HankenGrotesk-Regular',
    '500': 'HankenGrotesk-Medium',
    '600': 'HankenGrotesk-SemiBold',
    '700': 'HankenGrotesk-Bold',
    '800': 'HankenGrotesk-ExtraBold',
    '900': 'HankenGrotesk-Black',
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
