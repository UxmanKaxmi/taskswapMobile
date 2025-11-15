// src/constants/apiRoutes.ts

// ✅ Central enum for base route paths
export enum ApiRoute {
  TASKS = '/tasks',
  USERS = '/users',
  REMINDER_NOTES = '/reminderNote',
  NOTIFICATION = '/notification',
  VOTE = '/vote',
  COMMENTS = '/comments',
  REFERRALS = '/referrals',
}

// ✅ Builder functions for dynamic API routes
export const buildRoute = {
  // 📌 Task Routes
  task: (id: string) => `${ApiRoute.TASKS}/${id}`,
  completeTask: (id: string) => `${ApiRoute.TASKS}/${id}/complete`,
  uncompleteTask: (id: string) => `${ApiRoute.TASKS}/${id}/incomplete`,

  // 📌 User Routes
  user: (id: string) => `${ApiRoute.USERS}/${id}`,
  syncUserToDb: () => `${ApiRoute.USERS}`,
  matchUsers: () => `${ApiRoute.USERS}/match`,
  me: () => `${ApiRoute.USERS}/me`,
  searchFriends: (query: string, includeFollowed: boolean = true) =>
    `${ApiRoute.USERS}/search-friends?query=${encodeURIComponent(query)}&includeFollowed=${includeFollowed}`,
  friendProfile: (id: string) => `${ApiRoute.USERS}/${id}/profile`,

  // 📌 Reminder Note Routes (via Task)
  sendReminder: (taskId: string) => `${ApiRoute.REMINDER_NOTES}/${taskId}/remind`,
  getReminders: (taskId: string) => `${ApiRoute.REMINDER_NOTES}/${taskId}/reminders`,

  // 📌 Follow Routes
  //   follow: () => `${ApiRoute.USERS}/follow`,
  //   unfollow: () => `${ApiRoute.USERS}/unfollow`,
  toggleFollow: (userId: string) => `${ApiRoute.USERS}/toggleFollow/${userId}`,
  followers: () => `${ApiRoute.USERS}/followers`,
  following: () => `${ApiRoute.USERS}/following`,

  // 📌 Notifications Routes (via Task)
  getAllNotifications: () => `${ApiRoute.NOTIFICATION}`,
  markNotificationAsReadById: (notificationId: string) =>
    `${ApiRoute.NOTIFICATION}/${notificationId}/read`,
  markNotificationBatch: () => `${ApiRoute.NOTIFICATION}/mark-many-read`,

  // 📌 Vote Routes
  castVote: (taskId: string) => `${ApiRoute.VOTE}/tasks/${taskId}/vote`,
  getVotes: (taskId: string) => `${ApiRoute.VOTE}/tasks/${taskId}/votes`,

  // 📌 Comment Routes
  getComments: (taskId: string) => `${ApiRoute.COMMENTS}/${taskId}`,
  addComment: () => `${ApiRoute.COMMENTS}`,
  likeComment: (commentId: string) => `${ApiRoute.COMMENTS}/${commentId}/like`,
  toggleCommentLike: () => `${ApiRoute.COMMENTS}/like`,

  // 📌 Referral / Invite Routes
  referralLink: (channel?: 'sms' | 'whatsapp' | 'email') =>
    `${ApiRoute.REFERRALS}/link${channel ? `?channel=${channel}` : ''}`,
  rotateReferralLink: () => `${ApiRoute.REFERRALS}/link/rotate`,
  attributeReferral: () => `${ApiRoute.REFERRALS}/attribute`,
};
