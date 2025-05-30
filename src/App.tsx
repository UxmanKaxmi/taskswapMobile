import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from '@features/Auth/authProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@shared/components/Toast/toastConfig';
import { initializeNotifications } from './lib/notifications/initNotifications';
import NotificationPermissionPrompt from './lib/notifications/NotificationPermissionPrompt';
import firebase from '@react-native-firebase/app';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AnimatedBootSplash } from '@features/Splash/AnimatedBootSplash';

const queryClient = new QueryClient();

export default function App() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // set transparent status bar
    StatusBar.setBarStyle('dark-content');

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, []);

  useEffect(() => {
    console.log('✅ Firebase apps:', firebase.apps);
    initializeNotifications();
  }, []);

  return visible ? (
    <AnimatedBootSplash
      onAnimationEnd={() => {
        setVisible(false);
      }}
    />
  ) : (
    <QueryClientProvider client={queryClient}>
      <NotificationPermissionPrompt />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <Toast config={toastConfig} position="bottom" bottomOffset={60} />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    margin: 20,
    lineHeight: 30,
    color: '#333',
    textAlign: 'center',
  },
});
//     <QueryClientProvider client={queryClient}>
//       <NotificationPermissionPrompt />
//       <AuthProvider>
//         <RootNavigator />
//       </AuthProvider>
//       <Toast config={toastConfig} position="bottom" bottomOffset={60} />
//     </QueryClientProvider>
//   );
// }
