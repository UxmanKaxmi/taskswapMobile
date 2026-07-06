import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkColors, lightColors, ThemeColors } from './colors';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ThemeScheme = 'light' | 'dark';

const STORAGE_THEME_PREFERENCE = 'theme:preference';

export type ThemeContextValue = {
  /** What the user picked in settings. */
  preference: ThemePreference;
  /** The scheme actually in effect after resolving 'system'. */
  scheme: ThemeScheme;
  colors: ThemeColors;
  setPreference: (preference: ThemePreference) => void;
};

// Default lets components render outside the provider (tests, headless trees)
// without crashing — they just get the light palette.
const defaultValue: ThemeContextValue = {
  preference: 'system',
  scheme: 'light',
  colors: lightColors,
  setPreference: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_THEME_PREFERENCE)
      .then(saved => {
        if (isThemePreference(saved)) {
          setPreferenceState(saved);
        }
      })
      .catch(() => {});
  }, []);

  // Native surfaces (iOS tab bar material, alerts, pickers) follow the OS
  // appearance, not our JS palette — override it so they match the picked theme.
  useEffect(() => {
    // RN 0.85: the reset value is 'unspecified' (null crashes Android's
    // non-null native parameter).
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_THEME_PREFERENCE, next).catch(() => {});
  }, []);

  const scheme: ThemeScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      setPreference,
    }),
    [preference, scheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
