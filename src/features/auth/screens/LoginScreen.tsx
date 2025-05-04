import React from 'react';
import { View, Text, Button, Alert, Image } from 'react-native';
import { useAuth } from '../authProvider';

export default function LoginScreen() {
  const { user, signIn, signOut } = useAuth();

  if (user) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Welcome, {user.name}</Text>
        {user.photo && (
          <Image source={{ uri: user.photo }} style={{ width: 80, height: 80, borderRadius: 40 }} />
        )}
        <Button title="Sign Out" onPress={signOut} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Not logged in</Text>
      <Button
        title="Sign in with Google"
        onPress={async () => {
          try {
            await signIn();
          } catch (e: any) {
            Alert.alert('Login failed', e.message || 'Unknown error');
          }
        }}
      />
    </View>
  );
}
