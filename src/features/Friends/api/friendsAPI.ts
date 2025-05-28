import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';

export async function searchFriends(query: string, includeFollowed = true) {
  const url = buildRoute.searchFriends(query, includeFollowed);
  const response = await api.get(url);
  console.log(response.data);
  return response.data.friends;
}
