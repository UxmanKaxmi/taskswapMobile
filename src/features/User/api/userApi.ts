import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';

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

export const syncUserToDb = async (userId: string, fcmToken: string) => {
  const res = await api.post(buildRoute.syncUserToDb(), { userId, fcmToken });
  return res.data;
};
