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

type Friend = {
  id: string;
  photo: string;
  name: string;
  email: string;
  isFollowing: boolean;
};

type Props = {
  type: 'followers' | 'following';
  searchQuery?: string;
};

export default function FriendList({ type, searchQuery = '' }: Props) {
  const [debouncedQuery] = useDebounce(searchQuery.trim(), 300);
  const usingSearch = !!debouncedQuery;

  const {
    data: searchData = [],
    isLoading: isSearching,
    isError: isSearchError,
  } = useSearchFriends(debouncedQuery, true);

  const {
    data: followers = [],
    isLoading: loadingFollowers,
    isError: errorFollowers,
  } = useFollowers();

  const {
    data: following = [],
    isLoading: loadingFollowing,
    isError: errorFollowing,
  } = useFollowing();

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
        },
      }}
      emptyComponent={
        searchQuery.trim() ? (
          <EmptyState
            title="No matches found"
            subtitle="Try a different name or check your spelling."
          />
        ) : (
          <EmptyState title="No Friends Yet" subtitle="Invite or follow others to see them here." />
        )
      }
      renderItem={({ item }: { item: Friend }) => (
        <FriendFollowRow
          isLoading={isPending && variables === item.id}
          photo={item.photo}
          name={item.name}
          email={item.email}
          isFollowing={item.isFollowing}
          onToggleFollow={() => toggleFollow(item.id)}
        />
      )}
    />
  );
}
