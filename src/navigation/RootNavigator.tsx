// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { MainStackParamList } from 'navigation/navigation';
import { useAuth } from '@features/Auth/AuthProvider';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function RootNavigator() {
  const { user, loading, hasSeenFindFriendsScreen } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen
            name="App"
            component={AppNavigator}
            initialParams={{ showFindFriends: !hasSeenFindFriendsScreen }}
          />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
