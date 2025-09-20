import { theme } from './theme';

/**
 * useTheme
 * A simple hook to access your app's custom theme.
 * Works without context — just returns your static theme object.
 */
export const useTheme = () => theme;
