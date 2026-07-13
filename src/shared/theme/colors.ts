export const lightColors = {
  // Brand
  primary: '#7B6CF6', // Indigo – buttons, highlights
  onPrimary: '#FFFFFF', // Text/iconography on primary backgrounds

  accent: '#FF7043', // Deep orange – motivation actions
  onAccent: '#FFFFFF', // Text/iconography on accent backgrounds

  // Tactile Momentum palette
  tactileMomentumPrimary: '#FFD23F',
  tactileMomentumSecondary: '#16171F',
  tactileMomentumTertiary: '#2FECFD',
  tactileMomentumNeutral: '#7D766A',

  // Onboarding
  onboardingInk: '#16171F',
  onboardingInkSoft: '#2A2B36',
  onboardingPaper: '#F4F4EF',
  onboardingBackdropStart: '#F8F5EC',
  onboardingBackdropMid: '#FCF9F2',
  onboardingBackdropEnd: '#F6F2E6',
  onboardingCard: '#FFFFFF',
  onboardingPush: '#FFD23F',
  onboardingPushDeep: '#EDBB17',
  onboardingDone: '#1FA86B',
  onboardingDoneSoft: '#E3F4EC',
  onboardingMuted: '#73757D',
  onboardingLine: '#E6E6DF',

  // Circles identity (purple, prototype direction C)
  circleAccent: '#6C4CE1',
  circleAccentSoft: '#ECE6FB',
  circleAccentLine: '#C9BAF3',
  circleAccentGhost: 'rgba(108, 76, 225, 0.06)',

  // Neutral
  background: '#F7F8F4', // warm off-white
  card: '#FFFFFF',
  surface: '#FFFFFF', // White surfaces (cards, sheets)
  onSurface: '#212121', // Default text/icon on surface
  inkSurface: '#16171F', // Hero cards that stay ink-dark in BOTH themes (pair with onPrimary text)

  text: '#212121', // Near-black – main text
  muted: '#757575', // Mid-grey – placeholders, secondary text
  placeHolder: '#9AA4B2', // Light grey – input placeholders
  disabled: '#BDBDBD', // Light grey – disabled elements

  // Semantic
  success: '#66BB6A', // Green – success states
  error: '#E53935', // Red – error states
  warning: '#FFA726', // Amber – warnings
  info: '#42A5F5', // Blue – informational

  // Dividers / Borders
  border: '#E0E0E0', // Light grey – separators

  reminderBg: '#FFF0C8',
  adviceBg: '#E0F7FA',
  decisionBg: '#EDE7FF',
  motivationBg: '#D9F7E6',

  reminderBgHard: '#FFE08A',
  adviceBgHard: '#B3EBF0',
  decisionBgHard: '#C9B8FF',
  motivationBgHard: '#8DF3C3',
  motivationBgDark: '#047857',

  reminderBgHardest: '#F59E0B',
  adviceBgHardest: '#3B82F6',
  decisionBgHardest: '#9f67feff',
  decisionBgSoft: '#9e67fe55',

  motivationBgHardest: '#10B981',

  adviceIconBackground: '#EAF0FF',
  decisionIconBackground: '#F3E8FF',
  motivationIconBackground: '#e0feeeff',
  reminderIconBackground: '#FFF7E0',

  // Tabs
  tabActive: '#000',
  tabInactive: '#757575',
  inputBackground: '#F2F2F2',
  secondary: '#F59E0B', // amber-500
  transparent: 'transparent',

  calmBlue: '#3F5EF3',
  motivationPurple: '#7B6CF6',
  lavendarPink: '#D8B4F8',
  gradientDarkPurple: '#E9D9FF',

  // Soft tinted fills (danger cards, icon chips) that need a dark counterpart
  dangerSoftBg: '#FFF3F3',
  dangerSoftBorder: '#F5D6D6',
  warmIconChipBg: '#FFF4D1',
  dangerIconChipBg: '#FEECEC',
};

export type ThemeColors = typeof lightColors;

// Dark palette: brand/semantic hues stay, neutrals invert, tinted fills get
// deep muted counterparts that keep their hue.
export const darkColors: ThemeColors = {
  ...lightColors,

  // Onboarding neutrals (ink flips to light-on-dark)
  onboardingInk: '#F2F3F5',
  onboardingInkSoft: '#D3D5DC',
  onboardingPaper: '#131318',
  onboardingBackdropStart: '#0D0E13',
  onboardingBackdropMid: '#15161C',
  onboardingBackdropEnd: '#101116',
  onboardingCard: '#1E1F26',
  onboardingDoneSoft: '#14352A',
  onboardingMuted: '#9BA0AA',
  onboardingLine: '#2B2C35',

  // Circles identity (lighter accent for dark surfaces, deep soft fills)
  circleAccent: '#B4A3F5',
  circleAccentSoft: '#2A2145',
  circleAccentLine: '#4A3E78',
  circleAccentGhost: 'rgba(180, 163, 245, 0.10)',

  // Neutral
  background: '#101014',
  card: '#1E1F26',
  surface: '#1E1F26',
  onSurface: '#ECEDEF',
  inkSurface: '#23242C', // slightly elevated so ink cards still read against the dark bg

  text: '#ECEDEF',
  muted: '#A0A4AD',
  placeHolder: '#6E7683',
  disabled: '#4E525C',

  border: '#2E3038',

  reminderBg: '#3B300F',
  adviceBg: '#0F3238',
  decisionBg: '#2A2145',
  motivationBg: '#0F3526',

  reminderBgHard: '#5A461A',
  adviceBgHard: '#155E68',
  decisionBgHard: '#4A3A80',
  motivationBgHard: '#1B6647',

  adviceIconBackground: '#1D2A45',
  decisionIconBackground: '#2E2347',
  motivationIconBackground: '#15382B',
  reminderIconBackground: '#3B330F',

  tabActive: '#FFFFFF',
  tabInactive: '#8B8F98',
  inputBackground: '#26272F',

  gradientDarkPurple: '#3B2F5E',

  dangerSoftBg: '#331B1B',
  dangerSoftBorder: '#4A2626',
  warmIconChipBg: '#3A3115',
  dangerIconChipBg: '#3D2020',
};

export const palettes = {
  light: lightColors,
  dark: darkColors,
} as const;
