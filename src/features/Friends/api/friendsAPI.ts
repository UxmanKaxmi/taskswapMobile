import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { FriendProfile, SearchResultFriend } from '../types/friends';

export async function searchFriends(
  query: string,
  includeFollowed = true,
): Promise<SearchResultFriend[]> {
  const url = buildRoute.searchFriends(query, includeFollowed);
  const response = await api.get(url);
  return response.data.friends;
}

export async function getFriendProfile(friendId: string): Promise<FriendProfile> {
  const url = buildRoute.friendProfile(friendId);
  const response = await api.get(url);
  console.log(response.data);
  return response.data;
}
