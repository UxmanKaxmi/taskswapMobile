import { useMemo } from 'react';

import { ThemeColors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { useThemeContext } from './ThemeProvider';

/**
 * useTheme
 * Access the app theme. Colors follow the active scheme (light/dark/system)
 * from ThemeProvider; spacing and typography are static.
 */
export const useTheme = () => {
  const { colors, scheme, preference, setPreference } = useThemeContext();

  return useMemo(
    () => ({ colors, spacing, typography, scheme, preference, setPreference }),
    [colors, scheme, preference, setPreference],
  );
};

/**
 * useThemedStyles
 * Build a StyleSheet from the active palette. Define the factory at module
 * scope so its identity is stable:
 *
 *   const createStyles = (colors: ThemeColors) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(createStyles);
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useThemeContext();
  return useMemo(() => factory(colors), [colors, factory]);
}
