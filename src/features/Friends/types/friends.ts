type SearchResultFriend = {
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
