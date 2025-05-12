// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { MainStackParamList } from '@features/tasks/types/navigation';
import { useAuth } from '@features/auth/authProvider';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function RootNavigator() {
  const { user } = useAuth(); // Your auth logic here

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
