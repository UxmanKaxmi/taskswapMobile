import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { QueryClientProvider } from '@tanstack/react-query';
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
import { ThemeProvider, useTheme } from '@shared/theme';
import { incrementAppLaunchCount } from '@features/LaunchModals';
import { FeatureFlagsProvider } from '@shared/featureFlags';
import { FirstTimeHintsProvider } from '@features/FirstTimeHints';
import { MorphProvider } from '@shared/morph/MorphProvider';
import { navigationRef } from './navigation/navigationRef';
import NotificationNavigationBridge from './lib/notifications/NotificationNavigationBridge';
import { setNotificationNavigationReady } from './lib/notifications/notificationNavigation';
import { initDeepLinks } from './lib/deeplinks/deepLinkBridge';
import { queryClient } from './lib/react-query/client';

const loginImage = require('@assets/images/loginImage5.png');

function ThemedApp() {
  const { colors, scheme } = useTheme();

  const navTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.onboardingPaper,
        card: colors.card,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [colors, scheme]);

  useEffect(() => {
    StatusBar.setBarStyle(scheme === 'dark' ? 'light-content' : 'dark-content');

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.onboardingPaper);
      StatusBar.setTranslucent(false);
    }
  }, [colors, scheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.onboardingPaper }}>
      <BottomSheetModalProvider>
        <ModalProvider>
          <QueryClientProvider client={queryClient}>
            <NotificationPermissionPrompt />

            <AuthProvider>
              <FeatureFlagsProvider>
                <FirstTimeHintsProvider>
                  <MorphProvider>
                    <NavigationContainer
                      ref={navigationRef}
                      theme={navTheme}
                      onReady={() => setNotificationNavigationReady(true)}
                    >
                      <NotificationNavigationBridge />
                      <RootNavigator />
                    </NavigationContainer>
                  </MorphProvider>
                </FirstTimeHintsProvider>
              </FeatureFlagsProvider>
            </AuthProvider>

            <Toast config={toastConfig} position="bottom" bottomOffset={60} />
          </QueryClientProvider>
        </ModalProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [visible, setVisible] = useState(true);

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
    return initDeepLinks();
  }, []);

  useEffect(() => {
    incrementAppLaunchCount().catch(() => {});
  }, []);

  return visible ? (
    <AnimatedBootSplash onAnimationEnd={() => setVisible(false)} />
  ) : (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
