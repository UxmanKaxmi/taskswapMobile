import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPLAINER_SEEN_KEY = 'anonymous_posting_explainer_seen';

export async function hasSeenAnonymousPostingExplainer(): Promise<boolean> {
  // Dev builds always show the explainer so it's easy to iterate on.
  if (__DEV__) return false;

  const value = await AsyncStorage.getItem(EXPLAINER_SEEN_KEY);
  return value === 'true';
}

export async function markAnonymousPostingExplainerSeen(): Promise<void> {
  await AsyncStorage.setItem(EXPLAINER_SEEN_KEY, 'true');
}
