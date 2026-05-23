// src/lib/navigation/navigationUtils.ts

import { CommonActions, NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';

import { AppStackParamList, BottomTabParamList } from './navigation';
import { Task } from '@features/Tasks/types/tasks';
import { useAuth } from '@features/Auth/AuthProvider';

/* -------------------------------------------------------------------------- */
/*                               Typed Hooks                                   */
/* -------------------------------------------------------------------------- */

/**
 * Typed navigation hook for screens inside AppStack (stack screens).
 * @example
 * const navigation = useAppNavigation();
 * navigation.navigate("TaskDetail", { task });
 */
export const useAppNavigation = () => {
  return useNavigation<NavigationProp<AppStackParamList>>();
};

/**
 * Typed navigation hook for BottomTab screens.
 */
export const useTabNavigation = () => {
  return useNavigation<NavigationProp<BottomTabParamList>>();
};

/* -------------------------------------------------------------------------- */
/*                         Generic Type-Safe Navigate                          */
/* -------------------------------------------------------------------------- */

/**
 * Navigate inside AppStack (stack screens).
 * Supports screen params properly.
 * @example
 * navigateStack(nav, "TaskDetail", { taskId: "123" });
 */
export function navigateStack<T extends keyof AppStackParamList>(
  navigation: NavigationProp<AppStackParamList>,
  screen: T,
  ...[params]: undefined extends AppStackParamList[T]
    ? [] | [AppStackParamList[T]]
    : [AppStackParamList[T]]
) {
  (navigation.navigate as any)(screen, ...(params ? [params] : []));
}

/**
 * Navigate inside Tab screens (Home, Friends, Notification, Profile)
 * @example
 * navigateTab(nav, "Home");
 */
export function navigateTab<T extends keyof BottomTabParamList>(
  navigation: NavigationProp<BottomTabParamList>,
  screen: T,
) {
  (navigation.navigate as any)(screen);
}

/* -------------------------------------------------------------------------- */
/*                              Reset Navigation                               */
/* -------------------------------------------------------------------------- */

export function resetToStack<T extends keyof AppStackParamList>(
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

/* -------------------------------------------------------------------------- */
/*                               Helper Shortcuts                              */
/* -------------------------------------------------------------------------- */

/**
 * Open app settings — useful for permissions screens.
 */
export const openAppSettings = () => {
  Linking.openSettings();
};

/**
 * Navigate to someone's profile (friend's profile).
 * @example
 * openFriendsProfile(navigation, "user_123");
 */
export function openFriendsProfile(
  navigation: NavigationProp<AppStackParamList>,
  friendId: string,
  currentUserId?: string,
) {
  if (friendId === currentUserId) {
    navigation.navigate('Tabs', { screen: 'Profile' });
  } else {
    navigation.navigate('FriendsProfileScreen', { id: friendId });
  }
}

/**
 * Navigate to AddTask modal.
 * @example
 * openAddTask(nav);
 */
export function openAddTask(navigation: NavigationProp<AppStackParamList>, task?: Task) {
  (navigation.navigate as any)('AddTask', { task });
}

/**
 * Shortcut to navigate to a Task Detail screen.
 * @example
 * navigateToTaskDetails(navigation, task);
 */
export function navigateToTaskDetails(navigation: NavigationProp<AppStackParamList>, task: Task) {
  navigation.navigate('TaskDetail', { task });
}

export function resetToHomeRoot(navigation: any) {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: 'App',
        state: {
          routes: [
            {
              name: 'Tabs',
              state: {
                index: 0,
                routes: [{ name: 'Home' }],
              },
            },
          ],
        },
      },
    ],
  });
}

/**
 * Guards a navigation action behind authentication.
 *
 * If the user is not authenticated, navigates to `AuthIntro` and stores
 * the intended destination so the user can be redirected back after login.
 *
 * If the user *is* authenticated, immediately navigates to the target screen.
 *
 * @returns `true` if navigation proceeded, `false` if redirected to auth.
 *
 * @example
 * // Navigate only if authenticated
 * if (!checkAuthThenNavigate('AddTask')) return;
 *
 * @example
 * // Navigate with params
 * if (!checkAuthThenNavigate('TaskDetail', { taskId })) return;
 */

type AuthIntroOptions = {
  authContext?: string;
  authCopy?: {
    title: string;
    subtitle: string;
    cta: string;
  };
};

export function useCheckAuthThenNavigate() {
  const navigation = useAppNavigation();
  const route = useRoute();
  const { user } = useAuth();

  return function checkAuthThenNavigate<T extends keyof AppStackParamList>(
    screen?: T,
    params?: AppStackParamList[T],
    options?: AuthIntroOptions,
  ): boolean {
    if (!user) {
      console.log('screen', screen);
      console.log('route.name', route.name);

      (navigation.navigate as any)('AuthIntro', {
        redirectTo: (screen ?? route.name) as keyof AppStackParamList,
        params,
        authContext: options?.authContext,
        authCopy: options?.authCopy,
      });
      return false;
    }

    if (screen) {
      (navigation.navigate as any)(screen, params);
    }

    return true;
  };
}
