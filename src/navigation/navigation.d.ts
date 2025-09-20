import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task } from '../features/Tasks/types/tasks';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}

export type BottomTabParamList = {
  Home: undefined;
  Friends: undefined;
  AddTask: { task?: Task } | undefined;
  Notification: undefined;
  Profile: undefined;
};

// Main stack for authenticated users
export type MainStackParamList = {
  App: {
    showFindFriends?: boolean;
  };
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

// App stack (after login)
export type AppStackParamList = {
  replace(arg0: string, arg1: { screen: string }): void;
  Tabs: NavigatorScreenParams<BottomTabParamList>; // 👈 fix here
  Home: undefined;
  FindFriendsScreen: undefined;
  AddTask: { task?: Task } | undefined;
  TaskDetail: {
    taskId?: string;
    task?: Task;
    highlightCommentId?: string;
  };
  FindFriendsMainScreen: undefined;
  NotificationMainScreen: undefined;
  MyProfileMainScreen: undefined;
  MainDebugScreen: undefined;
  FriendsProfileScreen: {
    id: string;
  };
};

// Auth stack (login, register)
export type AuthStackParamList = {
  Login: undefined;
};

// ✅ Useful typed navigation props
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
