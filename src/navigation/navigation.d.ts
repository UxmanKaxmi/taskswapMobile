import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task } from '../features/Tasks/types/tasks';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}

// Main stack for authenticated users
export type MainStackParamList = {
  App: {
    showFindFriends?: boolean;
  };
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

// App stack (after login)
export type AppStackParamList = {
  Tabs: undefined;
  Home: undefined;
  FindFriendsScreen: undefined;
  AddTask: { task?: Task } | undefined;
  TaskDetail: { task: Task };
  FriendsMainScreen: undefined;
  NotificationMainScreen: undefined;
  MyProfileMainScreen: undefined;
};

// Auth stack (login, register)
export type AuthStackParamList = {
  Login: undefined;
};

// ✅ Useful typed navigation props
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
