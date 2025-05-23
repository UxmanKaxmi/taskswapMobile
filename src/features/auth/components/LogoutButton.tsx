// src/components/LogoutButton.tsx
import React from 'react';
import { Button, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStackParamList } from 'navigation/navigation';
import { useAuth } from '../authProvider';

export const LogoutButton = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user, signIn, signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => signOut(),
      },
    ]);
  };

  return <Button title="Logout" onPress={handleLogout} />;
};
