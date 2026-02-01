export enum QueryKeys {
  Tasks = 'tasks',
  Task = 'task',
  ReminderNotes = 'reminders',
  User = 'user',
  Auth = 'auth',
  Followers = 'followers',
  Following = 'following',
  MatchedUsers = 'matched-users',
  Notification = 'notification',
  MyProfile = 'my-profile',
  SearchFriends = 'search-friends',
  FriendProfile = 'friend-profile',
  Votes = 'votes',
  Comments = 'comments',
  ReferralLink = 'referral-link',
  Push = 'push',
}

export const buildQueryKey = {
  tasks: (userId?: string) => [QueryKeys.Tasks, userId],
  taskById: (taskId: string) => [QueryKeys.Task, taskId],
  remindersForTask: (taskId: string) => [QueryKeys.ReminderNotes, taskId],
  user: () => [QueryKeys.User],
  auth: () => [QueryKeys.Auth],
  followers: () => [QueryKeys.Followers],
  following: () => [QueryKeys.Following],
  matchedUsers: () => [QueryKeys.MatchedUsers],
  notifications: () => [QueryKeys.Notification],
  myProfile: () => [QueryKeys.MyProfile],
  searchFriends: (query: string, includeFollowed: boolean = true) => [
    QueryKeys.SearchFriends,
    query,
    includeFollowed,
  ],
  friendProfile: (id: string) => [QueryKeys.FriendProfile, id],
  votesForTask: (taskId: string) => [QueryKeys.Votes, taskId],
  commentsForTask: (taskId: string) => [QueryKeys.Comments, taskId],
  referralLink: () => [QueryKeys.ReferralLink],

  //for Task Pushes
  pushesForTask: (taskId: string) => [QueryKeys.Push, taskId],
};
