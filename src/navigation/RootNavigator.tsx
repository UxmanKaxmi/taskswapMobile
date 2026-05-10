import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import IntroScreen from '@features/Intro/screens/IntroScreen';
import AuthIntroScreen from '@features/Auth/screens/AuthIntroScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerPostLogoutNavigation } from '@shared/api/authBridge';
import AddTaskNavigator from '@features/AddTask/navigation/AddTaskNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [firstTime, setFirstTime] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    registerPostLogoutNavigation(() => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'App',
          },
        ],
      });
    });
  }, []);

  useEffect(() => {
    async function checkFirstLaunch() {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setFirstTime(!seen); // true if first launch

      console.log('first', !seen);

      setLoading(false);
    }
    checkFirstLaunch();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* First-time onboarding */}
      {firstTime && <Stack.Screen name="OnboardingIntro" component={IntroScreen} />}

      {/* Main App */}
      <Stack.Screen
        name="App"
        component={AppNavigator}
        options={{
          // Used when skipping onboarding to avoid the default "slide" feel.
          animation: 'fade',
          animationDuration: 220,
        }}
      />

      {/* Auth Prompt (login-required intro) */}
      <Stack.Screen
        name="AuthIntro"
        component={AuthIntroScreen}
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 300,
          animationTypeForReplace: 'push',
        }}
      />

      {/* Login Flow */}
      <Stack.Screen name="Auth" component={AuthNavigator} />

      <Stack.Screen name="AddTaskScreen" component={AddTaskNavigator} />
    </Stack.Navigator>
  );
}
