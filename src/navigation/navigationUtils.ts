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
 * @param navigation - Navigation object from useTypedNavigation or props.
 * @param screen - Screen name from AppStackParamList.
 * @param params - Optional params for the screen.
 * @example
 * navigateTo(navigation, 'TaskDetails', { taskId: '123' });
 */
export function navigateTo<T extends keyof AppStackParamList>(
  navigation: NavigationProp<AppStackParamList>,
  screen: T,
  params?: AppStackParamList[T],
) {
  navigation.navigate(screen, params);
}

/**
 * Reset navigation stack and navigate to a new screen.
 * @param navigation - Navigation object from useTypedNavigation or props.
 * @param screen - Target screen.
 * @param params - Optional params.
 * @example
 * resetNavigation(navigation, 'Login');
 */
export function resetNavigation<T extends keyof AppStackParamList>(
  navigation: NavigationProp<AppStackParamList>,
  screen: T,
  params?: AppStackParamList[T],
) {
  navigation.reset({
    index: 0,
    routes: [{ name: screen, params }],
  });
}

/**
 * Open app settings, commonly used after denied permissions.
 * @example
 * openAppSettings();
 */
export const openAppSettings = () => {
  Linking.openSettings();
};

/**
 * Shortcut to navigate to a user's FriendsProfile screen.
 * @param navigation - Navigation object from useTypedNavigation or props.
 * @param friendId - The user ID of the friend.
 * @example
 * openFriendsProfile(navigation, 'user_abc123');
 */
export function openFriendsProfile(
  navigation: NavigationProp<AppStackParamList>,
  friendId: string,
) {
  navigation.navigate('FriendsProfileScreen', { id: friendId });
}

export function navigateToTaskDetails(navigation: NavigationProp<AppStackParamList>, task: Task) {
  navigation.navigate('TaskDetail', { task });
}
