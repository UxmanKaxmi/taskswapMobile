import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task } from '../../features/Tasks/types/tasks';
import { AddTaskStackParamList } from '@features/AddTask/navigation/AddTaskNavigator';

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
  App:
    | NavigatorScreenParams<AppStackParamList>
    | {
        showFindFriends?: boolean;
      };
  Auth: NavigatorScreenParams<AuthStackParamList>;
  AuthIntro?:
    | {
        redirectTo?: keyof AppStackParamList;
        params?: AppStackParamList[keyof AppStackParamList];
        authContext?: 'Friends' | string;
        authCopy?: {
          title: string;
          subtitle: string;
          cta: string;
        };
      }
    | undefined;
  OnboardingIntro: undefined;
  AddTaskScreen: NavigatorScreenParams<AddTaskStackParamList>;
};

/* ------------------------------ APP NAVIGATOR ------------------------------ */

// This controls everything above the tabs
export type AppStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList>;
  AuthIntro:
    | {
        redirectTo?: keyof AppStackParamList | keyof BottomTabParamList;
        params?: any;
        authContext?: string;
        authCopy?: {
          title: string;
          subtitle: string;
          cta: string;
        };
      }
    | undefined;
  Friends: undefined;
  Notification: undefined;
  Profile: undefined;

  // STACK ONLY SCREENS (open above tabs)
  AddTask: NavigatorScreenParams<AddTaskStackParamList> & {
    task?: Task; // optional: for "Edit Task" later
  };
  FilterTasksModal: undefined;

  TaskDetail:
    | {
        task?: Task;
        taskId?: string;
        highlightCommentId?: string;
        openAdviceComposer?: boolean;
        openShareModal?: boolean;
        scrollTo?: 'progress';
        openUpdateComposer?: boolean;
        pushId?: string;
        progressUpdateId?: string;
        beatId?: string;
        highlightBeatId?: string;
      }
    | undefined;

  // friend flows (opened from Friends tab)
  FindFriendsScreen:
    | {
        openedFromHome?: boolean;
      }
    | undefined;
  InviteFriendsScreen: undefined;

  // notifications
  NotificationMainScreen: undefined;

  // profile
  MyProfileMainScreen: undefined;
  SendFeedbackScreen: undefined;

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
        params?: AppStackParamList[keyof AppStackParamList];
      }
    | undefined;
};

/* --------------------------- NAVIGATION PROPS --------------------------- */

export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
