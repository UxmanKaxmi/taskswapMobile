// src/lib/react-query/provider.tsx
import React, { ReactNode, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { queryClient } from './client';

type Props = {
  children: ReactNode;
};

// React Native has no window focus events, so react-query's refetchOnWindowFocus
// never fires on its own. Bridge AppState → focusManager so queries refetch when
// the app returns to the foreground.
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

export default function ReactQueryProvider({ children }: Props) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
