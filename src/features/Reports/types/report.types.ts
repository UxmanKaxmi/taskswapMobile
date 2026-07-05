export type ReportReason =
  | 'harassment'
  | 'hate_or_abuse'
  | 'sexual_content'
  | 'spam_or_scam'
  | 'self_harm_or_danger'
  | 'other';

export type ReportTaskPayload = {
  taskId: string;
  reason: ReportReason;
  details?: string;
  reportedUserId?: string;
};

export type BlockUserPayload = {
  userId: string;
};

export type BlockedUser = {
  id: string;
  name: string;
  username?: string | null;
  email?: string | null;
  photo?: string | null;
  avatar?: string | null;
  blockedAt?: string;
};
