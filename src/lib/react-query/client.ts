import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Off by default to avoid refetching every query on each foreground.
      // AppState is bridged to focusManager in provider.tsx, and screens that
      // need fresh data on focus (e.g. task detail) opt in per-query.
      refetchOnWindowFocus: false,
    },
  },
});
