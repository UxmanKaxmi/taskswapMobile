// src/lib/navigation/navigationUtils.ts

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';
import { AppStackParamList } from './navigation';
import { Task } from '@features/Tasks/types/tasks';

/**
 * Typed navigation hook for convenience with AppStackParamList.
 * @example
 * const navigation = useTypedNavigation();
 * navigation.navigate('Home');
 */
export const useTypedNavigation = () => {
  return useNavigation<NavigationProp<AppStackParamList>>();
};

/**
 * Navigate to a specific screen with optional params.
 * Type-safe for routes with or without params.
 *
 * @example
 * navigateTo(navigation, 'Home');
 * navigateTo(navigation, 'TaskDetail', { taskId: '123' });
 */
export function navigateTo<T extends keyof AppStackParamList>(
  navigation: NavigationProp<AppStackParamList>,
  screen: T,
  ...[params]: undefined extends AppStackParamList[T]
    ? [] | [AppStackParamList[T]]
    : [AppStackParamList[T]]
) {
  navigation.navigate(screen, ...(params ? [params] : []));
}

/**
 * Reset navigation stack and navigate to a new screen.
 * @example
 * resetNavigation(navigation, 'Login');
 */
export function resetNavigation<T extends keyof AppStackParamList>(
  navigation: NavigationProp<AppStackParamList>,
  screen: T,
  ...[params]: undefined extends AppStackParamList[T]
    ? [] | [AppStackParamList[T]]
    : [AppStackParamList[T]]
) {
  navigation.reset({
    index: 0,
    routes: [{ name: screen, params }],
  });
}

/**
 * Open app settings — useful for permissions screens.
 */
export const openAppSettings = () => {
  Linking.openSettings();
};

/**
 * Shortcut to navigate to a user's FriendsProfile screen.
 * @example
 * openFriendsProfile(navigation, 'user_abc123');
 */
export function openFriendsProfile(
  navigation: NavigationProp<AppStackParamList>,
  friendId: string,
) {
  navigation.navigate('FriendsProfileScreen', { id: friendId });
}

/**
 * Shortcut to navigate to a task detail screen.
 * @example
 * navigateToTaskDetails(navigation, task);
 */
export function navigateToTaskDetails(navigation: NavigationProp<AppStackParamList>, task: Task) {
  navigation.navigate('TaskDetail', { task });
}
