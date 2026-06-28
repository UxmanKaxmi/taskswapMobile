import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { useFollowing } from '@features/User/hooks/useFollowing';
import ListView from '@shared/components/ListView/ListView';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { vs } from 'react-native-size-matters';
import FriendFollowRow from './FriendsFollowRow';
import { useToggleFollow } from '@features/User/hooks/useToggleFollow';
import EmptyState from '@features/Empty/EmptyState';
import { useSearchFriends } from '../hooks/useSearchFriends';
import { useDebounce } from 'use-debounce';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { openFriendsProfile } from '@navigation/types/navigationUtils';
import { haptics } from '@shared/utils/haptics';
import { useAuth } from '@features/Auth/AuthProvider';
import { spacing } from '@shared/theme';

type Friend = {
  id: string;
  photo: string;
  name: string;
  username?: string | null;
  email?: string;
  isFollowing: boolean;
};

type Props = {
  type: 'followers' | 'following';
  searchQuery?: string;
};

export default function FriendList({ type, searchQuery = '' }: Props) {
  const [debouncedQuery] = useDebounce(searchQuery.trim(), 300);
  const usingSearch = !!debouncedQuery;
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user } = useAuth();

  const { data: searchData = [], isLoading: isSearching } = useSearchFriends(debouncedQuery, true);

  const { data: followers = [], isLoading: loadingFollowers } = useFollowers();

  const { data: following = [], isLoading: loadingFollowing } = useFollowing();

  const { mutate: toggleFollow, isPending, variables } = useToggleFollow(debouncedQuery);

  const data = usingSearch ? searchData : type === 'followers' ? followers : following;

  const isLoading = usingSearch
    ? isSearching
    : type === 'followers'
      ? loadingFollowers
      : loadingFollowing;

  if (isLoading) {
    return (
      <View style={{ alignSelf: 'center', justifyContent: 'center', flex: 1 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <ListView
      data={data}
      flatListProps={{
        ItemSeparatorComponent: () => <AppBorder />,
        keyExtractor: user => user.id,
        ListFooterComponent: <View />,
        contentContainerStyle: {
          flexGrow: 1,
          maxWidth: '100%',
          paddingHorizontal: spacing.lg,
        },
      }}
      emptyComponent={
        searchQuery.trim() ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: vs(50) }}>
            <EmptyState
              title="No matches found"
              subtitle="Try a different name or check your spelling."
            />
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: vs(50) }}>
            <EmptyState
              title="No Friends Yet"
              subtitle="Invite or follow others to see them here."
            />
          </View>
        )
      }
      renderItem={({ item }: { item: Friend }) => (
        <FriendFollowRow
          onPressRow={() => openFriendsProfile(navigation, item.id, user?.id)}
          isLoading={isPending && variables === item.id}
          userId={item.id}
          photo={item.photo}
          name={item.name}
          username={item.username}
          isFollowing={item.isFollowing}
          onToggleFollow={() => {
            haptics.success();
            return toggleFollow(item.id);
          }}
        />
      )}
    />
  );
}
