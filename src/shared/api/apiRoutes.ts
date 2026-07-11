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
  FEATURE_FLAGS = '/features',
  FEEDBACK = '/feedback',
  BEATS = '/beats',
}

// ✅ Builder functions for dynamic API routes
export const buildRoute = {
  // 📌 Goal Routes
  task: (id: string) => `${ApiRoute.TASKS}/${id}`,
  reportTask: (id: string) => `${ApiRoute.TASKS}/${id}/report`,
  taskProgress: (id: string) => `${ApiRoute.TASKS}/${id}/progress`,
  completeGoal: (id: string) => `${ApiRoute.TASKS}/${id}/complete`,
  revealGoal: (id: string) => `${ApiRoute.TASKS}/${id}/reveal`,
  uncompleteGoal: (id: string) => `${ApiRoute.TASKS}/${id}/incomplete`,
  featureFlags: () => `${ApiRoute.FEATURE_FLAGS}`,
  submitFeedback: () => `${ApiRoute.FEEDBACK}`,

  // 📌 User Routes
  user: (id: string) => `${ApiRoute.USERS}/${id}`,
  syncUserToDb: () => `${ApiRoute.USERS}`,
  matchUsers: () => `${ApiRoute.USERS}/match`,
  me: () => `${ApiRoute.USERS}/me`,
  updateFcmToken: () => `${ApiRoute.USERS}/me/fcm-token`,
  deleteMe: () => `${ApiRoute.USERS}/me`,
  blockedUsers: () => `${ApiRoute.USERS}/me/blocked-users`,
  blockUser: (id: string) => `${ApiRoute.USERS}/${id}/block`,
  homeSummary: () => `${ApiRoute.USERS}/me/home-summary`,
  myImpact: () => `${ApiRoute.USERS}/me/impact`,
  searchFriends: (query: string, includeFollowed: boolean = true) =>
    `${ApiRoute.USERS}/search-friends?query=${encodeURIComponent(query)}&includeFollowed=${includeFollowed}`,
  friendProfile: (id: string) => `${ApiRoute.USERS}/${id}/profile`,
  incrementGoalViews: (taskId: string) => `${ApiRoute.TASKS}/${taskId}/views`,

  // 📌 Reminder Note Routes (via Goal)
  sendReminder: (taskId: string) => `${ApiRoute.REMINDER_NOTES}/${taskId}/remind`,
  getReminders: (taskId: string) => `${ApiRoute.REMINDER_NOTES}/${taskId}/reminders`,

  // 📌 Follow Routes
  //   follow: () => `${ApiRoute.USERS}/follow`,
  //   unfollow: () => `${ApiRoute.USERS}/unfollow`,
  toggleFollow: (userId: string) => `${ApiRoute.USERS}/toggleFollow/${userId}`,
  followers: () => `${ApiRoute.USERS}/followers`,
  following: () => `${ApiRoute.USERS}/following`,

  // 📌 Notifications Routes (via Goal)
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

  // ✅ Push (Encouragement)
  toggleGoalPush: (taskId: string) => `${ApiRoute.TASKS}/${taskId}/push`,
  getGoalPushes: (taskId: string) => `${ApiRoute.TASKS}/${taskId}/pushes`,

  // ✅ Cheer
  cheerBeat: (beatId: string) => `${ApiRoute.BEATS}/${beatId}/cheer`,

  // ✅ First-time hints ("beats" in the product spec — named hints on the
  // wire because /beats already belongs to cheerable content beats)
  firstTimeHint: (hintId: string) => `${ApiRoute.USERS}/me/hints/${hintId}`,
  firstTimeHintsReset: () => `${ApiRoute.USERS}/me/hints`,
};
