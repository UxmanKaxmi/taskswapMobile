import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'launch_modal_seen:';
const APP_LAUNCH_COUNT_KEY = 'app_launch_count';
const LAST_SHOWN_LAUNCH_KEY = 'launch_modal_last_shown_launch';

export function getLaunchModalSeenKey(id: string) {
  return `${KEY_PREFIX}${id}`;
}

export async function hasSeenLaunchModal(id: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(getLaunchModalSeenKey(id));
  return value === '1';
}

export async function markLaunchModalSeen(id: string): Promise<void> {
  await AsyncStorage.setItem(getLaunchModalSeenKey(id), '1');
}

export async function resetLaunchModalSeen(id: string): Promise<void> {
  await AsyncStorage.removeItem(getLaunchModalSeenKey(id));
}

export async function resetAllLaunchModalsSeen(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const modalKeys = keys.filter(key => key.startsWith(KEY_PREFIX));
  if (modalKeys.length > 0) {
    await AsyncStorage.multiRemove(modalKeys);
  }
}

export async function getAppLaunchCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(APP_LAUNCH_COUNT_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function incrementAppLaunchCount(): Promise<number> {
  const current = await getAppLaunchCount();
  const next = current + 1;
  await AsyncStorage.setItem(APP_LAUNCH_COUNT_KEY, String(next));
  return next;
}

export async function getLastShownLaunch(): Promise<number> {
  const raw = await AsyncStorage.getItem(LAST_SHOWN_LAUNCH_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function setLastShownLaunch(launchCount: number): Promise<void> {
  await AsyncStorage.setItem(LAST_SHOWN_LAUNCH_KEY, String(launchCount));
}
