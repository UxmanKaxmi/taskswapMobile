import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image, SectionList } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '@shared/components/TextElement/TextElement';
import { useMatchUsers } from '../hooks/useMatchUsers';
import FriendFollowRow from '../components/FriendsFollowRow';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp, AppStackParamList, MainNavigationProp } from 'navigation/navigation';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { useAuth } from '@features/Auth/AuthProvider';
import ListView from '@shared/components/ListView/ListView';
import { Layout } from '@shared/components/Layout';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { vs } from 'react-native-size-matters';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { useToggleFollow } from '@features/User/hooks/useToggleFollow';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey } from '@shared/constants/queryKeys';

export default function FindFriendsScreen() {
  const navigation = useNavigation<AppStackParamList>();
  const { colors, spacing } = useTheme();
  const { data: matches = [], isLoading, isError, refetch } = useMatchUsers();
  const { setHasSeenFindFriendsScreen, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const { mutate: toggleFollow, isPending, variables, error } = useToggleFollow();

  console.log(matches, 'matches');
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Error toggling follow:', error);
    }
  }, [error]);

  useEffect(() => {
    setHasSeenFindFriendsScreen(true);
  }, []);

  const handleToggleFollow = (userId: string) => {
    toggleFollow(userId);
  };

  //remove own self
  const filteredMatches = matches.filter(match => match.id !== user?.id);

  const googleMatches = filteredMatches.filter(match => match.source === 'google');
  const phoneMatches = filteredMatches.filter(match => match.source === 'phone');

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (isError) {
    return (
      <Layout>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md }}
        >
          <TextElement variant="title" style={{ marginBottom: spacing.sm }}>
            Failed to load friends
          </TextElement>
          <TextElement variant="body" color="muted" style={{ marginBottom: spacing.md }}>
            Please check your internet connection or try again.
          </TextElement>
          <PrimaryButton
            title="Retry"
            onPress={() => {
              queryClient.invalidateQueries({ queryKey: buildQueryKey.matchedUsers() });
              refetch();
            }}
          />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <SectionList
        sections={[
          { title: 'From Google Contacts', data: googleMatches },
          { title: 'From Phone Contacts', data: phoneMatches },
        ].filter(section => section.data.length > 0)}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <TextElement variant="subtitle" style={{ marginTop: spacing.sm, fontWeight: '600' }}>
            {section.title}
          </TextElement>
        )}
        renderItem={({ item }) => (
          <FriendFollowRow
            onPressRow={() => { }}
            isLoading={isPending && variables === item.id}
            photo={item.photo}
            name={item.name}
            email={item.email}
            isFollowing={item.isFollowing}
            onToggleFollow={() => handleToggleFollow(item.id)}
          />
        )}
        ItemSeparatorComponent={AppBorder}
        ListHeaderComponent={() => (
          <View style={{ marginVertical: spacing.sm }}>
            <TextElement variant="title" style={{ fontWeight: '700' }}>
              Find your people <TextElement style={{ fontSize: 20 }}>👋</TextElement>
            </TextElement>
            <TextElement
              variant="body"
              color="muted"
              style={{ textAlign: 'left', marginTop: spacing.xs }}
            >
              Add friends so TaskSwap feels a little more familiar.
            </TextElement>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
            <TextElement variant="body" color="muted" style={{ marginBottom: spacing.sm }}>
              No friends found on this device.
            </TextElement>
            <PrimaryButton
              title="Let's continue"
              onPress={() =>
                navigation?.replace('Tabs', {
                  screen: 'Home',
                })
              }
              style={{ paddingHorizontal: spacing.md }}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: vs(40) }}
      />

      {matches.length > 0 && (
        <PrimaryButton
          title="Go to Home"
          onPress={() =>
            navigation?.replace('Tabs', {
              screen: 'Home',
            })
          }
          style={{ paddingHorizontal: spacing.md }}
        />
      )}
    </Layout>
  );
}
