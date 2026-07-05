import { navigationRef } from '@navigation/navigationRef';
import type { AppStackParamList } from '@navigation/types/navigation';
import {
  getNotificationRoute,
  normalizeNotificationPayload,
  type NotificationRoute,
} from './notificationRoutes';

type AuthSnapshot = {
  ready: boolean;
  isAuthenticated: boolean;
};

type HandleNotificationOptions = {
  responseKey?: string;
};

let navigationReady = false;
let authSnapshot: AuthSnapshot = {
  ready: false,
  isAuthenticated: false,
};

let pendingRoute: NotificationRoute | null = null;
let lastHandledResponseKey: string | null = null;
let lastHandledAt = 0;

const DUPLICATE_WINDOW_MS = 5000;

function shouldIgnoreDuplicate(responseKey?: string) {
  if (!responseKey) return false;

  const now = Date.now();
  if (lastHandledResponseKey === responseKey && now - lastHandledAt < DUPLICATE_WINDOW_MS) {
    return true;
  }

  lastHandledResponseKey = responseKey;
  lastHandledAt = now;
  return false;
}

function getFallbackKey(data: unknown) {
  const payload = normalizeNotificationPayload(data);
  const route = getNotificationRoute(data);

  return (
    payload.notificationId ||
    payload.progressUpdateId ||
    payload.commentId ||
    payload.pushId ||
    payload.taskId ||
    payload.notificationType ||
    payload.type ||
    route.screen
  );
}

function canFlush() {
  return navigationReady && authSnapshot.ready && !!pendingRoute;
}

function navigateRoute(route: NotificationRoute) {
  if (!navigationRef.isReady()) {
    pendingRoute = route;
    return;
  }

  if (!authSnapshot.isAuthenticated) {
    const redirectTo =
      route.screen === 'NotificationMainScreen' ? ('Notification' as const) : route.screen;

    navigationRef.navigate('AuthIntro', {
      redirectTo,
      ...(route.screen === 'GoalDetail' ? { params: route.params } : {}),
      authCopy: route.authCopy,
    } as any);
    return;
  }

  if (route.screen === 'GoalDetail') {
    navigationRef.navigate('App', {
      screen: 'GoalDetail',
      params: route.params,
    } as any);
    return;
  }

  if (route.screen === 'Home') {
    navigationRef.navigate('App', {
      screen: 'Tabs',
      params: {
        screen: 'Home',
      },
    } as any);
    return;
  }

  navigationRef.navigate('App', {
    screen: 'Tabs',
    params: {
      screen: 'Notification',
    },
  } as any);
}

function flushPendingRoute() {
  if (!canFlush()) return;

  const route = pendingRoute;
  pendingRoute = null;

  if (!route) return;

  navigateRoute(route);
}

export function setNotificationNavigationReady(ready: boolean) {
  navigationReady = ready;
  flushPendingRoute();
}

export function setNotificationAuthSnapshot(snapshot: AuthSnapshot) {
  authSnapshot = snapshot;
  flushPendingRoute();
}

export function handleNotificationRoute(
  data: unknown,
  options: HandleNotificationOptions = {},
): boolean {
  const responseKey = options.responseKey ?? getFallbackKey(data);
  if (shouldIgnoreDuplicate(responseKey)) {
    return false;
  }

  const route = getNotificationRoute(data);
  pendingRoute = route;

  flushPendingRoute();
  return true;
}

export function __resetNotificationNavigationState() {
  navigationReady = false;
  authSnapshot = {
    ready: false,
    isAuthenticated: false,
  };
  pendingRoute = null;
  lastHandledResponseKey = null;
  lastHandledAt = 0;
}

export function __getPendingNotificationRoute() {
  return pendingRoute;
}

export type { AppStackParamList };
