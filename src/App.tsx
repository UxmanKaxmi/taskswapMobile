import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from '@features/Auth/authProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@shared/components/Toast/toastConfig';
import { initializeNotifications } from './lib/notifications/initNotifications';
import NotificationPermissionPrompt from './lib/notifications/NotificationPermissionPrompt';
import firebase from '@react-native-firebase/app';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    console.log('✅ Firebase apps:', firebase.apps);
    initializeNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationPermissionPrompt />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <Toast config={toastConfig} position="bottom" bottomOffset={60} />
    </QueryClientProvider>
  );
}
