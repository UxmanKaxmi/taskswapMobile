// src/features/friends/components/FriendList.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { useFollowing } from '@features/User/hooks/useFollowing';
// import FriendListItem from './FriendListItem'; // Removed as it is unused
import ListView from '@shared/components/ListView/ListView';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { vs } from 'react-native-size-matters';
import FriendFollowRow from './FriendsFollowRow';
import { useToggleFollow } from '@features/User/hooks/useToggleFollow';
import EmptyState from '@features/Empty/EmptyState';
import { repeatAndFlatten } from '@shared/utils/helperFunctions';
import TextElement from '@shared/components/TextElement/TextElement';

type Friend = {
  id: string;
  photo: string;
  name: string;
  email: string;
  isFollowing: boolean;
}; // Retained as it is now used for typing

type Props = {
  type: 'followers' | 'following';
  searchQuery?: string;
};

export default function FriendList({ type, searchQuery = '' }: Props) {
  const {
    data = [],
    isLoading: _,
    isError: __,
  } = type === 'followers' ? useFollowers() : useFollowing();
  const { mutate: toggleFollow, isPending, variables } = useToggleFollow(); // Removed unused 'error'

  const filteredData = useMemo(() => {
    return data.filter((user: { name: string }) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    );
  }, [data, searchQuery]);

  return (
    <ListView
      data={filteredData}
      flatListProps={{
        ItemSeparatorComponent: () => <AppBorder />,
        keyExtractor: user => user.id,
        ListFooterComponent: <View style={{}} />,
        // ListEmptyComponent: <TextElement>No friends found.</TextElement>,
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
