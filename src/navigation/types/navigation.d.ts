import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task } from '../../features/Tasks/types/tasks';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}

/* --------------------------- BOTTOM TAB PAGES --------------------------- */

// These are the visible main screens the user can switch between
export type BottomTabParamList = {
  Home: undefined;
  Friends: undefined; // Friends tab entry point
  AddTaskButton: undefined; // fake tab button (opens modal)
  Notification: undefined;
  Profile: undefined;
};

/* ----------------------------- MAIN ROOT STACK ----------------------------- */

// Root of the app — decides App vs Auth
export type MainStackParamList = {
  App: {
    showFindFriends?: boolean;
  };
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

/* ------------------------------ APP NAVIGATOR ------------------------------ */

// This controls everything above the tabs
export type AppStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList>;

  // STACK ONLY SCREENS (open above tabs)
  AddTask: { task?: Task } | undefined;

  TaskDetail:
    | {
        task?: Task;
        taskId?: string;
        highlightCommentId?: string;
      }
    | undefined;

  // friend flows (opened from Friends tab)
  FindFriendsScreen: undefined;
  InviteFriendsScreen: undefined;

  // notifications
  NotificationMainScreen: undefined;

  // profile
  MyProfileMainScreen: undefined;

  // debug
  MainDebugScreen: undefined;

  // viewing someone else's profile
  FriendsProfileScreen: {
    id: string;
  };
};

/* ---------------------------- AUTH NAVIGATOR ---------------------------- */

export type AuthStackParamList = {
  Intro?: undefined;
  Login:
    | {
        redirectTo?: keyof AppStackParamList;
      }
    | undefined;
};

/* --------------------------- NAVIGATION PROPS --------------------------- */

export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
