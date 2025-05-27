import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { UserProfile } from '../types/myProfile.types';

/**
 * Fetch the current authenticated user's profile.
 */
export async function getMe(): Promise<UserProfile> {
  const response = await api.get<UserProfile>(buildRoute.me());

  console.log('ttt', response.data);
  return response.data;
}
