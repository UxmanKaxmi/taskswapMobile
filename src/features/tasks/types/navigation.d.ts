// src/types/navigation.d.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import { Task } from './tasks';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}

// Main stack for authenticated users
export type MainStackParamList = {
  App: NavigatorScreenParams<AppStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

// App stack (after login)
export type AppStackParamList = {
  Home: undefined;
  FindFriendsScreen: undefined;
  AddTask: { task?: Task } | undefined;
  TaskDetail: { task: Task };
};

// Auth stack (login, register)
export type AuthStackParamList = {
  Login: undefined;
};
