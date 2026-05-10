import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';

// export const followUser = async (followingId: string) => {
//   const res = await api.post(buildRoute.follow());
//   return res.data;
// };

// export const unfollowUser = async (followingId: string) => {
//   const res = await api.post(buildRoute.unfollow());
//   return res.data;
// };

export const toggleFollow = async (followingId: string) => {
  const res = await api.get(buildRoute.toggleFollow(followingId));

  console.log(res.data);
  return res.data;
};

export const getFollowers = async () => {
  const res = await api.get(buildRoute.followers());
  console.log('getFollowers', res.data);
  return res.data; // Array of User
};

export const getFollowing = async () => {
  const res = await api.get(buildRoute.following());
  console.log('getFollowing', res.data);

  return res.data; // Array of User
};

// export const syncUserToDb = async () => {
//   const res = await api.post(buildRoute.syncUserToDb());

//   return res.data; // Array of User
// };

type GoogleSyncPayload = {
  id: string;
  name: string;
  email: string;
  photo?: string;
  fcmToken?: string;
};

export const syncUserToDb = async (payload: GoogleSyncPayload, googleIdToken: string) => {
  const res = await api.post(buildRoute.syncUserToDb(), payload, {
    headers: { Authorization: `Bearer ${googleIdToken}` },
    skipAuthLogout: true,
    skipAuthRefresh: true,
  } as CustomAxiosRequestConfig);
  return res.data;
};
