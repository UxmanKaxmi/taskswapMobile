export type FeedbackCategory = 'confusing' | 'bug' | 'idea' | 'positive' | 'other';

export type FeedbackPayload = {
  category?: FeedbackCategory;
  message: string;
  appVersion: string;
  platform: 'ios' | 'android';
  device?: string;
  osVersion?: string;
  currentScreen?: string;
  loggedInUserId?: string;
  timeSubmitted: string;
};
