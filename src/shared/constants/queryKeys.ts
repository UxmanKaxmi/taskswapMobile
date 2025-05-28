export enum QueryKeys {
  Tasks = 'tasks',
  ReminderNotes = 'reminders',
  User = 'user',
  Auth = 'auth',
  Followers = 'followers',
  Following = 'following',
  MatchedUsers = 'matched-users',
  Notification = 'notification',
  MyProfile = 'my-profile',
  SearchFriends = 'search-friends',
}

export const buildQueryKey = {
  tasks: () => [QueryKeys.Tasks],
  taskById: (taskId: string) => [QueryKeys.Tasks, taskId],
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
};
