import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_SEEN_KEY = 'circles_intro_seen';

export async function hasSeenCirclesIntro(): Promise<boolean> {
  // Dev builds always show the intro so it's easy to iterate on.
  if (__DEV__) return false;

  const value = await AsyncStorage.getItem(INTRO_SEEN_KEY);
  return value === 'true';
}

export async function markCirclesIntroSeen(): Promise<void> {
  await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
}
