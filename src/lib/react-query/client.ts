import { AppState, AppStateStatus } from 'react-native';
import { focusManager, QueryClient } from '@tanstack/react-query';

// React Native has no window focus, so bridge AppState foregrounding into
// react-query's focusManager. Queries that opt into refetchOnWindowFocus
// (task detail, the feed) refresh when the app returns to the foreground.
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

AppState.addEventListener('change', onAppStateChange);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Off by default to avoid refetching every query on each foreground.
      // Screens that need fresh data on focus (e.g. task detail) opt in
      // per-query; the AppState bridge above makes those opt-ins real.
      refetchOnWindowFocus: false,
    },
  },
});
