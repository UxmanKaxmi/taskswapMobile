import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@shared/components/Toast/toastConfig';
import { initializeNotifications } from './lib/notifications/initNotifications';
import NotificationPermissionPrompt from './lib/notifications/NotificationPermissionPrompt';
import firebase from '@react-native-firebase/app';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { AnimatedBootSplash } from '@features/Splash/AnimatedBootSplash';
import { AuthProvider } from '@features/Auth/AuthProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppInfoBottomSheetProvider } from '@shared/components/AppInfoBottomSheet/AppInfoBottomSheetProvider';

const queryClient = new QueryClient();

const LightNavTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
  },
};

export default function App() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFFFFF');
      StatusBar.setTranslucent(true);
    }
  }, []);

  useEffect(() => {
    console.log('✅ Firebase apps:', firebase.apps);
    initializeNotifications();
  }, []);

  return visible ? (
    <AnimatedBootSplash onAnimationEnd={() => setVisible(false)} />
  ) : (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <BottomSheetModalProvider>
        <AppInfoBottomSheetProvider>
          <QueryClientProvider client={queryClient}>
            <NotificationPermissionPrompt />

            <AuthProvider>
              <NavigationContainer theme={LightNavTheme}>
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>

            <Toast config={toastConfig} position="bottom" bottomOffset={60} />
          </QueryClientProvider>
        </AppInfoBottomSheetProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
