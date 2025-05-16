// src/features/friends/screens/FindFriendsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '@shared/api/axios';
import TextElement from '@shared/components/TextElement/TextElement';
import { useTheme } from '@shared/theme/useTheme';
import { fetchGoogleContacts } from '@shared/utils/googleAuth';

export default function FindFriendsScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<
    Array<{ id: string; name: string; email: string; photo?: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const emails = await fetchGoogleContacts();
        console.log('[CONTACTS]', emails);

        const resp = await api.post('/users/match', { emails });
        const matchedUsers = resp.data;

        console.log('[MATCHES]', matchedUsers);
        setMatches(matchedUsers);

        if (matchedUsers.length === 0) {
          navigation.navigate('App', { screen: 'Home' });
        }
      } catch (err) {
        console.error('[MATCH ERR]', err);
        navigation.navigate('App', { screen: 'Home' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={matches}
      keyExtractor={u => u.id}
      contentContainerStyle={{ padding: spacing.md }}
      ListEmptyComponent={
        <TextElement variant="body" color="muted">
          No friends found on this device.
        </TextElement>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <TextElement variant="body" weight="600">
            {item.name}
          </TextElement>
          <TextElement variant="caption" color="muted" style={{ marginLeft: spacing.sm }}>
            {item.email}
          </TextElement>
        </TouchableOpacity>
      )}
    />
  );
}
