export enum QueryKeys {
  Goals = 'tasks',
  Goal = 'task',
  User = 'user',
  Auth = 'auth',
  Followers = 'followers',
  Following = 'following',
  MatchedUsers = 'matched-users',
  Notification = 'notification',
  MyProfile = 'my-profile',
  HomeSummary = 'home-summary',
  SearchFriends = 'search-friends',
  FriendProfile = 'friend-profile',
  ReferralLink = 'referral-link',
  Push = 'push',
  BlockedUsers = 'blocked-users',
}

export const buildQueryKey = {
  tasks: (userId?: string, feedSort?: string) => {
    if (userId || feedSort) {
      return [QueryKeys.Goals, userId ?? 'anonymous', feedSort ?? 'needs_push'];
    }

    return [QueryKeys.Goals];
  },
  taskById: (taskId: string) => [QueryKeys.Goal, taskId],
  user: () => [QueryKeys.User],
  auth: () => [QueryKeys.Auth],
  followers: () => [QueryKeys.Followers],
  following: () => [QueryKeys.Following],
  matchedUsers: () => [QueryKeys.MatchedUsers],
  notifications: () => [QueryKeys.Notification],
  myProfile: () => [QueryKeys.MyProfile],
  homeSummary: (utcOffsetMinutes?: number) => [QueryKeys.HomeSummary, utcOffsetMinutes],
  searchFriends: (query: string, includeFollowed: boolean = true) => [
    QueryKeys.SearchFriends,
    query,
    includeFollowed,
  ],
  friendProfile: (id: string) => [QueryKeys.FriendProfile, id],
  referralLink: () => [QueryKeys.ReferralLink],
  blockedUsers: () => [QueryKeys.BlockedUsers],

  //for Goal Pushes
  pushesForGoal: (taskId: string) => [QueryKeys.Push, taskId],
};
