import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@shared/components/Toast/toastConfig';
import { initializeNotifications } from './lib/notifications/initNotifications';
import NotificationPermissionPrompt from './lib/notifications/NotificationPermissionPrompt';
import firebase from '@react-native-firebase/app';
import { Image, Platform, StatusBar } from 'react-native';
import { AnimatedBootSplash } from '@features/Splash/AnimatedBootSplash';
import { AuthProvider } from '@features/Auth/AuthProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ModalProvider } from '@shared/components/ModalProvider';
import { colors } from '@shared/theme/colors';
import { incrementAppLaunchCount } from '@features/LaunchModals';
import { FeatureFlagsProvider } from '@shared/featureFlags';
import { navigationRef } from './navigation/navigationRef';
import NotificationNavigationBridge from './lib/notifications/NotificationNavigationBridge';
import { setNotificationNavigationReady } from './lib/notifications/notificationNavigation';

const queryClient = new QueryClient();
const loginImage = require('@assets/images/loginImage5.png');

const LightNavTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    // background: '#FFFFFF',
  },
};

export default function App() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.surface);
      StatusBar.setTranslucent(false);
    }
  }, []);

  useEffect(() => {
    console.log('✅ Firebase apps:', firebase.apps);
    let cleanup = () => {};

    void initializeNotifications()
      .then(unsubscribe => {
        cleanup = unsubscribe;
      })
      .catch(() => {});

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const asset = Image.resolveAssetSource(loginImage);
    if (asset?.uri) {
      Image.prefetch(asset.uri);
    }
  }, []);

  useEffect(() => {
    incrementAppLaunchCount().catch(() => {});
  }, []);

  return visible ? (
    <AnimatedBootSplash onAnimationEnd={() => setVisible(false)} />
  ) : (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <BottomSheetModalProvider>
        <ModalProvider>
          <QueryClientProvider client={queryClient}>
            <NotificationPermissionPrompt />

            <AuthProvider>
              <FeatureFlagsProvider>
                <NavigationContainer
                  ref={navigationRef}
                  theme={LightNavTheme}
                  onReady={() => setNotificationNavigationReady(true)}
                >
                  <NotificationNavigationBridge />
                  <RootNavigator />
                </NavigationContainer>
              </FeatureFlagsProvider>
            </AuthProvider>

            <Toast config={toastConfig} position="bottom" bottomOffset={60} />
          </QueryClientProvider>
        </ModalProvider>
      </BottomSheetModalProvider>
      {/* {showDevBadge && (
        <View pointerEvents="none" style={styles.devBadgeContainer}>
          <View style={styles.devBadge}>
            <View style={styles.devBadgeDot} />
            <View style={styles.devBadgeTextWrap}>
              <Text style={styles.devBadgeText}>DEV</Text>
              <Text style={styles.devBadgeSubText}>API: {backendUrl}</Text>
            </View>
          </View>
        </View>
      )} */}
    </GestureHandlerRootView>
  );
}
//     <QueryClientProvider client={queryClient}>
//       <NotificationPermissionPrompt />
//       <AuthProvider>
//         <RootNavigator />
//       </AuthProvider>
//       <Toast config={toastConfig} position="bottom" bottomOffset={60} />
//     </QueryClientProvider>
//   );
// }
